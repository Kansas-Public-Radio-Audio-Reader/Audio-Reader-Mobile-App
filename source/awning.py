import math
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

pdf_path = "awning_design_corrected_tilt_mac.pdf"
c = canvas.Canvas(pdf_path, pagesize=letter)
width, height = letter


text = c.beginText(1inch, height-1inch)
text.setFont("Helvetica", 11)
lines = [
'Awning Design Cut-Sheet - Lawrence, KS (24" projection, 10-15 degree downward tilt)',
'',
'Window: 54 in tall, 40 in wide',
'Projection: 24 in horizontal',
'Tilt: 10-15 degree downward over the window (leading edge lower than wall mount)',
'Width: 64-76 in (window + 12-18 in extension on each side)',
'',
'Benefits:',
'- Improved summer shading without increasing projection',
'- Maintains winter sun access for passive heating',
'- Better rainwater runoff',
'- Slight reduction in clearance under awning',
'',
'Practical Ranges:',
'- Angle: 10-15 degree downward',
'- Projection: 24 in horizontal (shading like ~28-30 in flat)',
'- Length: 64-76 in to cover window + sides',
'',
'Recommendation:',
'- Mount top of awning flush above window',
'- Leading edge slopes downward 10-15 degree',
'- Width: 64-76 in',
'- Provides reasonable May-Sep shading without side fins',
]
for line in lines:
text.textLine(line)
c.drawText(text)

c.showPage()


c.setFont("Helvetica-Bold", 12)
c.drawCentredString(width/2, height-0.5*inch, 'Awning Geometry - 24 in projection, 10-15 degree downward tilt')


win_x = 2inch
win_y = 2inch
win_h = 54/12inch
win_w = 40/12inch
c.rect(win_x, win_y, win_w, win_h, stroke=1, fill=0)
c.setFont("Helvetica", 10)
c.drawString(win_x, win_y+win_h+0.1*inch, 'Window 54" x 40"')


proj = 24/12*inch
tilt_deg = 15
tilt_rad = math.radians(tilt_deg)
drop = proj * math.tan(tilt_rad)

awning_start_x = win_x
awning_start_y = win_y + win_h
awning_end_x = awning_start_x + proj
awning_end_y = awning_start_y - drop
c.line(awning_start_x, awning_start_y, awning_end_x, awning_end_y)
c.drawString(awning_end_x-0.5inch, awning_end_y-0.2inch, 'Awning (24" @ 15 degree tilt)')


c.line(awning_start_x, awning_start_y-0.4inch, awning_start_x+proj, awning_start_y-0.4inch)
c.line(awning_start_x, awning_start_y-0.35inch, awning_start_x, awning_start_y-0.45inch)
c.line(awning_start_x+proj, awning_start_y-0.35inch, awning_start_x+proj, awning_start_y-0.45inch)
c.drawCentredString(awning_start_x+proj/2, awning_start_y-0.55*inch, '24" projection')


c.line(awning_end_x+0.4inch, awning_start_y, awning_end_x+0.4inch, awning_end_y)
c.line(awning_end_x+0.35inch, awning_start_y, awning_end_x+0.45inch, awning_start_y)
c.line(awning_end_x+0.35inch, awning_end_y, awning_end_x+0.45inch, awning_end_y)
c.drawString(awning_end_x+0.5*inch, (awning_start_y+awning_end_y)/2, f'~{drop/inch:.1f}" drop')

c.showPage()
c.save()

print(f"PDF generated at {pdf_path}")


