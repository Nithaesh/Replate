import flet as ft

def show_donor_view(page: ft.Page, on_back_click):
    page.clean() 

    # --- Helper: Google Button ---
    # --- Helper: Google Button (Updated with Image) ---
    def create_google_button(on_click_action):
        return ft.ElevatedButton(
            content=ft.Row(
                [
                    # CHANGE: Used ft.Image instead of ft.Icon
                    # This looks for 'google.png' in your assets folder
                    ft.Image(src="google.png", width=24, height=24), 
                    
                    ft.Text("Login with Google", color="black", weight="bold"),
                ],
                alignment="center",
                spacing=10
            ),
            width=320, 
            height=50,
            bgcolor="white",
            color="black",
            elevation=5, 
            on_click=on_click_action
        )
    # --- Page Content ---
    logo_image = ft.Image(src="icon.png", width=60, height=60, fit="contain")
    title_text = ft.Text("RePlate", size=30, weight="bold", color="black")
    logo_row = ft.Row([logo_image, title_text], alignment="center", spacing=10)

    page_header = ft.Text("Donor Login", size=25, weight="bold", color="black")

    google_btn = create_google_button(lambda x: print("Google Login Clicked"))

    back_btn = ft.TextButton(content=ft.Text("<- Back", color="blue"), on_click=on_back_click)

    # --- Layout ---
    # 1. The Content Column
    content_column = ft.Column(
        [
            ft.Container(height=10),
            logo_row,
            ft.Container(height=40),
            page_header,
            ft.Container(height=30),
            google_btn,
            ft.Container(height=30),
            register_link,
            ft.Container(height=10),
            back_btn
        ],
        horizontal_alignment="center",
    )

    # 2. The Responsive Card Wrapper
    # This box is fixed at 360px wide.
    # On a phone, this is the whole screen.
    # On a laptop, this is a neat centered box.
    responsive_card = ft.Container(
        content=content_column,
        width=360,  
        padding=20,
        alignment=ft.alignment.Alignment(0, 0) 
    )
    
    # 3. Center the Card on the Screen
    page.add(
        ft.Container(
            content=responsive_card,
            alignment=ft.alignment.Alignment(0, 0), 
            expand=True 
        )
    )