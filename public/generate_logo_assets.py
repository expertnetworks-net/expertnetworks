from pathlib import Path

import numpy as np
from PIL import Image
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas
from skimage import filters, measure


ROOT = Path.home() / "Desktop" / "Logo EN"
SOURCE = ROOT / "Gemini_Generated_Image_lxagc8lxagc8lxag.png"
OUTPUT = ROOT / "favicon-assets"
MASTER_SIZE = 2048
EXPORT_SIZES = [16, 32, 48, 96, 192, 512]


def polygon_area(points: np.ndarray) -> float:
    x = points[:, 0]
    y = points[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


def fmt(value: float) -> str:
    return f"{value:.2f}".rstrip("0").rstrip(".")


def build_clean_alpha(crop_rgb: np.ndarray, crop_mask: np.ndarray, color: np.ndarray) -> np.ndarray:
    logo_rgb = color.astype(np.float32)
    denom = np.maximum(255.0 - logo_rgb, 1.0)
    alpha_candidates = (255.0 - crop_rgb.astype(np.float32)) / denom
    alpha = np.median(alpha_candidates, axis=2)
    alpha = np.clip(alpha, 0.0, 1.0)

    soft_region = filters.gaussian(crop_mask.astype(np.float32), sigma=1.0, preserve_range=True) > 0.002
    alpha[~soft_region] = 0.0

    interior = crop_mask & (crop_rgb.mean(axis=2) < 210)
    alpha[interior] = np.maximum(alpha[interior], 0.96)
    alpha = np.clip(alpha, 0.0, 1.0)
    alpha[alpha > 0.985] = 1.0
    alpha[alpha < 0.02] = 0.0
    return alpha


def contour_paths(alpha: np.ndarray) -> list[np.ndarray]:
    smooth = filters.gaussian(alpha.astype(np.float32), sigma=1.15, preserve_range=True)
    contours = measure.find_contours(smooth, 0.5)

    paths: list[np.ndarray] = []
    for contour in contours:
        approx = measure.approximate_polygon(contour, tolerance=1.35)
        if len(approx) < 3:
            continue
        points = np.column_stack([approx[:, 1], approx[:, 0]])
        if abs(polygon_area(points)) < 250:
            continue
        paths.append(points)

    return sorted(paths, key=lambda pts: abs(polygon_area(pts)), reverse=True)


def write_svg(paths: list[np.ndarray], color_hex: str, out_path: Path) -> None:
    segments: list[str] = []
    for points in paths:
        segments.append(f"M {fmt(points[0, 0])} {fmt(points[0, 1])}")
        for x, y in points[1:]:
            segments.append(f"L {fmt(x)} {fmt(y)}")
        segments.append("Z")

    svg = "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {MASTER_SIZE} {MASTER_SIZE}" width="{MASTER_SIZE}" height="{MASTER_SIZE}">',
            f'  <path fill="{color_hex}" fill-rule="evenodd" d="{" ".join(segments)}"/>',
            "</svg>",
        ]
    )
    out_path.write_text(svg, encoding="utf-8")


def write_pdf(paths: list[np.ndarray], color: np.ndarray, out_path: Path) -> None:
    page_size = 512.0
    scale = page_size / MASTER_SIZE

    pdf = canvas.Canvas(str(out_path), pagesize=(page_size, page_size))
    pdf.setTitle("Gemini Logo Vector")
    pdf.setAuthor("OpenAI Codex")
    pdf.setSubject("Traced vector logo asset")
    pdf.setFillColor(Color(*(color / 255.0)))

    path = pdf.beginPath()
    for points in paths:
        x0, y0 = points[0] * scale
        path.moveTo(x0, page_size - y0)
        for x, y in points[1:]:
            path.lineTo(x * scale, page_size - y * scale)
        path.close()

    pdf.drawPath(path, fill=1, stroke=0, fillMode=0)
    pdf.showPage()
    pdf.save()


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    image = Image.open(SOURCE).convert("RGBA")
    rgba = np.array(image)
    rgb = rgba[:, :, :3]

    dark_mask = rgb.mean(axis=2) < 245
    labels = measure.label(dark_mask, connectivity=2)
    regions = measure.regionprops(labels)
    keep_labels = [region.label for region in regions if region.area > 5000]
    logo_mask = np.isin(labels, keep_labels)

    ys, xs = np.where(logo_mask)
    pad = 24
    y0 = max(0, int(ys.min()) - pad)
    y1 = min(image.height, int(ys.max()) + pad + 1)
    x0 = max(0, int(xs.min()) - pad)
    x1 = min(image.width, int(xs.max()) + pad + 1)

    crop_rgb = rgb[y0:y1, x0:x1]
    crop_mask = logo_mask[y0:y1, x0:x1]

    solid_pixels = crop_rgb[crop_mask & (crop_rgb.mean(axis=2) < 210)]
    if len(solid_pixels) == 0:
        solid_pixels = crop_rgb[crop_mask]
    color = np.median(solid_pixels, axis=0).round().astype(np.uint8)
    color_hex = "#" + "".join(f"{channel:02x}" for channel in color.tolist())

    alpha = build_clean_alpha(crop_rgb, crop_mask, color)

    cropped = np.zeros((crop_rgb.shape[0], crop_rgb.shape[1], 4), dtype=np.uint8)
    cropped[:, :, :3] = color
    cropped[:, :, 3] = np.round(alpha * 255).astype(np.uint8)
    cropped_image = Image.fromarray(cropped, mode="RGBA")
    cropped_image = cropped_image.crop(cropped_image.getbbox())
    cropped_path = OUTPUT / "gemini-logo-transparent-crop.png"
    cropped_image.save(cropped_path)

    usable_area = int(MASTER_SIZE * 0.78)
    scale = min(usable_area / cropped_image.width, usable_area / cropped_image.height)
    resized = cropped_image.resize(
        (max(1, round(cropped_image.width * scale)), max(1, round(cropped_image.height * scale))),
        Image.Resampling.LANCZOS,
    )

    master = Image.new("RGBA", (MASTER_SIZE, MASTER_SIZE), (0, 0, 0, 0))
    origin = ((MASTER_SIZE - resized.width) // 2, (MASTER_SIZE - resized.height) // 2)
    master.alpha_composite(resized, origin)

    master_path = OUTPUT / "gemini-logo-transparent-master-2048.png"
    master.save(master_path)

    for size in EXPORT_SIZES:
        export = master.resize((size, size), Image.Resampling.LANCZOS)
        export.save(OUTPUT / f"favicon-{size}.png")

    master.save(
        OUTPUT / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    alpha_master = np.array(master)[:, :, 3].astype(np.float32) / 255.0
    paths = contour_paths(alpha_master)
    if not paths:
        raise RuntimeError("No vector contours were extracted from the cleaned logo.")

    svg_path = OUTPUT / "gemini-logo-vector.svg"
    pdf_path = OUTPUT / "gemini-logo-vector.pdf"
    write_svg(paths, color_hex, svg_path)
    write_pdf(paths, color, pdf_path)

    print(f"Source: {SOURCE}")
    print(f"Color: {color_hex}")
    for path in [
        cropped_path,
        master_path,
        *(OUTPUT / f"favicon-{size}.png" for size in EXPORT_SIZES),
        OUTPUT / "favicon.ico",
        svg_path,
        pdf_path,
    ]:
        print(path)


if __name__ == "__main__":
    main()
