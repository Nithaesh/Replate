import flet as ft
import donor_page 

def main(page: ft.Page):
    # --- Page Settings ---
    page.title = "RePlate Login"
    page.vertical_alignment = "center"
    page.horizontal_alignment = "center"
    page.bgcolor = "white"
    
    # Enable scrolling for small screens
    page.scroll = "adaptive"

    # --- Navigation Function ---
    def show_home(e=None):
        page.clean()

        # 1. Logo & Title
        logo_image = ft.Image(src="icon.png", width=60, height=60, fit="contain")
        title_text = ft.Text("RePlate", size=35, weight="bold", color="black")
        
        logo_row = ft.Row(
            [logo_image, title_text],
            alignment="center",
            spacing=10
        )

        # 2. Buttons (Fixed Icon Error + Responsive Width)
        ngo_login_button = ft.ElevatedButton(
            content=ft.Text("Login as NGO", color="white"),
            height=50,
            bgcolor="blue",
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=10)),
            width=1000 # Fills the responsive card width
        )

        donor_login_button = ft.ElevatedButton(
            content=ft.Text("Login as Donor", color="white"),
            height=50,
            bgcolor="green",
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=10)),
            width=1000, # Fills the responsive card width
            on_click=lambda e: donor_page.show_donor_view(page, show_home) 
        )

       

        # 3. Layout (Responsive Strategy)
        main_content = ft.Column(
            [
                ft.Container(height=20),
                logo_row,
                ft.Container(height=40),
                ngo_login_button,
                ft.Container(height=15),
                donor_login_button,
                ft.Container(height=30),
                register_link
            ],
            horizontal_alignment="center",
        )

        # 4. The Responsive Wrapper
        # This Container forces the content to be max 360px wide (Mobile size)
        # But centers it perfectly on larger Laptop/Web screens.
        card_layout = ft.Container(
            content=main_content,
            width=360, 
            padding=20,
            alignment=ft.alignment.Alignment(0, 0)
        )

        page.add(
            ft.Container(
                content=card_layout,
                alignment=ft.alignment.Alignment(0, 0),
                expand=True
            )
        )

    # Start the app
    show_home()

ft.app(target=main, assets_dir="assets")