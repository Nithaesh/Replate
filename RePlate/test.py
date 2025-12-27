import flet as ft
import firebase_admin
from firebase_admin import credentials, auth, firestore
import re
from datetime import datetime
import os

# --- Firebase Setup ---
db = None
try:
    if not firebase_admin._apps:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        key_path = os.path.join(current_dir, "serviceAccountKey.json")
        # Only try to load if file exists to prevent crash if key is missing
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("Firebase connected successfully.")
        else:
            print("WARNING: serviceAccountKey.json not found. Firebase not connected.")
except Exception as e:
    print(f"WARNING: Firebase failed to connect. {e}")

# --- Constants ---
PRIMARY_GREEN = "#4CAF50"
DARK_GREEN = "#2E7D32"
LIGHT_GREEN = "#81C784"
PRIMARY_BLUE = "#2196F3"
DARK_BLUE = "#1565C0"
LIGHT_BLUE = "#64B5F6"
TEXT_COLOR = "#1A237E"
GRAY_TEXT = "#757575"
WHITE = "#FFFFFF"

# --- Regions Data ---
INDIA_REGIONS = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada"],
    "Arunachal Pradesh": ["Itanagar"],
    "Assam": ["Guwahati", "Silchar"],
    "Bihar": ["Patna", "Gaya"],
    "Chhattisgarh": ["Raipur", "Bilaspur"],
    "Goa": ["Panaji", "Margao"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Haryana": ["Chandigarh", "Faridabad", "Gurgaon"],
    "Himachal Pradesh": ["Shimla", "Dharamshala"],
    "Jharkhand": ["Ranchi", "Jamshedpur"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima"],
    "Odisha": ["Bhubaneswar", "Cuttack"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar"],
    "West Bengal": ["Kolkata", "Siliguri"],
}


class RePlateApp:
    def __init__(self, page: ft.Page):
        self.page = page
        self.page.title = "RePlate - Turning Leftovers into Lifelines"
        self.page.theme_mode = ft.ThemeMode.LIGHT
        self.page.padding = 0
        self.page.bgcolor = WHITE
        self.page.window_width = 400
        self.page.window_height = 800

        self.current_user = None
        self.user_role = None

        self.show_login_page()

    def show_login_page(self):
        """Display login page"""
        self.page.clean()

        logo = ft.Image(
            src="RePlate_logo.png",
            width=250,
            height=250,
            fit="contain",
        )

        username_field = ft.TextField(
            label="Username",
            width=300,
            border_color=PRIMARY_GREEN,
            focused_border_color=PRIMARY_BLUE,
        )

        password_field = ft.TextField(
            label="Password",
            width=300,
            password=True,
            can_reveal_password=True,
            border_color=PRIMARY_GREEN,
            focused_border_color=PRIMARY_BLUE,
        )

        remember_me = ft.Checkbox(label="Remember Me", value=False)

        forgot_password = ft.TextButton(
            content=ft.Text(value="Forgot Password?", color=PRIMARY_BLUE)
        )

        remember_row = ft.Row(
            controls=[remember_me, forgot_password],
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            width=300,
        )

        login_button = ft.ElevatedButton(
            content=ft.Text(value="Login", color=WHITE),
            width=300,
            height=50,
            bgcolor=PRIMARY_GREEN,
            on_click=lambda _: self.handle_login(
                username_field.value, password_field.value
            ),
        )

        not_member_row = ft.Row(
            controls=[
                ft.Text(value="Not a member?", color=GRAY_TEXT, size=12),
                ft.TextButton(
                    content=ft.Text(value="Create an account", color=PRIMARY_BLUE),
                    on_click=lambda _: self.show_role_selection(),
                ),
            ],
            alignment=ft.MainAxisAlignment.CENTER,
        )

        login_container = ft.Container(
            content=ft.Column(
                controls=[
                    ft.Container(height=40),
                    logo,
                    ft.Container(height=10),
                    username_field,
                    ft.Container(height=20),
                    password_field,
                    ft.Container(height=15),
                    remember_row,
                    ft.Container(height=30),
                    login_button,
                    ft.Container(height=10),
                    not_member_row,
                ],
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                alignment=ft.MainAxisAlignment.START,
            ),
            padding=20,
        )

        self.page.add(login_container)
        self.page.update()

    def show_role_selection(self):
        """Display role selection page"""
        self.page.clean()

        main_title = ft.Text(
            value="Please select your",
            size=32,
            weight=ft.FontWeight.BOLD,
            color="#1A237E",
            text_align=ft.TextAlign.CENTER,
        )

        subtitle = ft.Text(
            value="Please select your role to continue",
            size=18,
            color="#1A237E",
            text_align=ft.TextAlign.CENTER,
        )

        donor_button = ft.Container(
            content=ft.Row(
                controls=[
                    ft.Container(
                        content=ft.Image(
                            src="donor_icon.png",
                            width=35,
                            height=35,
                        ),
                        margin=ft.margin.only(left=20),
                    ),
                    ft.Text(
                        value="I am a Donor",
                        size=18,
                        weight=ft.FontWeight.W_500,
                        color=WHITE,
                    ),
                ],
                alignment=ft.MainAxisAlignment.START,
                spacing=20,
            ),
            width=320,
            height=70,
            bgcolor=PRIMARY_GREEN,
            border_radius=35,
            shadow=ft.BoxShadow(
                spread_radius=1,
                blur_radius=10,
                color="#00000030",
                offset=ft.Offset(0, 4),
            ),
            on_click=lambda _: self.show_donor_signup(),
        )

        receiver_button = ft.Container(
            content=ft.Row(
                controls=[
                    ft.Container(
                        content=ft.Image(
                            src="receiver_icon.png",
                            width=35,
                            height=35,
                        ),
                        margin=ft.margin.only(left=20),
                    ),
                    ft.Text(
                        value="I am a Receiver",
                        size=18,
                        weight=ft.FontWeight.W_500,
                        color=WHITE,
                    ),
                ],
                alignment=ft.MainAxisAlignment.START,
                spacing=20,
            ),
            width=320,
            height=70,
            bgcolor=PRIMARY_BLUE,
            border_radius=35,
            shadow=ft.BoxShadow(
                spread_radius=1,
                blur_radius=10,
                color="#00000030",
                offset=ft.Offset(0, 4),
            ),
            on_click=lambda _: self.show_receiver_signup(),
        )

        back_button = ft.TextButton(
            content=ft.Text(value="← Back to Login", color="#64B5F6", size=14),
            on_click=lambda _: self.show_login_page(),
        )

        role_container = ft.Container(
            content=ft.Column(
                controls=[
                    ft.Container(height=80),
                    main_title,
                    ft.Container(height=10),
                    subtitle,
                    ft.Container(height=80),
                    donor_button,
                    ft.Container(height=30),
                    receiver_button,
                    ft.Container(height=120),
                    back_button,
                ],
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                alignment=ft.MainAxisAlignment.START,
            ),
            padding=20,
            gradient=ft.LinearGradient(
                begin=ft.Alignment(-1, -1),
                end=ft.Alignment(1, 1),
                colors=["#E3F2FD", "#B2EBF2", "#C8E6C9"],
            ),
            expand=True,
        )

        self.page.add(role_container)
        self.page.update()

    def show_donor_signup(self):
        """Display donor signup page"""
        self.page.clean()
        
        title = ft.Text(
            value="Donor Registration",
            size=28,
            weight=ft.FontWeight.BOLD,
            color=TEXT_COLOR,
            text_align=ft.TextAlign.CENTER,
        )
        
        name_field = ft.TextField(
            label="Name of Donor (Individual/Organization)",
            width=350,
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
        )
        
        mobile_field = ft.TextField(
            label="Mobile Number",
            width=350,
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
            keyboard_type=ft.KeyboardType.PHONE,
        )
        
        password_field = ft.TextField(
            label="Password",
            width=350,
            password=True,
            can_reveal_password=True,
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
        )

        state_dropdown = ft.Dropdown(
            label="State",
            width=350,
            options=[ft.dropdown.Option(s) for s in INDIA_REGIONS.keys()],
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
        )
        
        district_field = ft.TextField(
            label="District",
            width=350,
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
        )
        
        city_field = ft.TextField(
            label="City",
            width=350,
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
        )
        
        pincode_field = ft.TextField(
            label="Pincode",
            width=350,
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
            keyboard_type=ft.KeyboardType.NUMBER,
        )
        
        additional_field_container = ft.Column(
            controls=[],
            spacing=20,
        )
        
        def on_role_change(e):
            additional_field_container.controls.clear()
            selected_role = role_dropdown.value
            
            if selected_role == "Others":
                other_role_field = ft.TextField(
                    label="Please specify your role",
                    width=350,
                    border_color=PRIMARY_GREEN,
                    focused_border_color=DARK_GREEN,
                )
                additional_field_container.controls.append(other_role_field)
            elif selected_role in ["Restaurant/Caterer", "Hostel/Mess"]:
                org_name_field = ft.TextField(
                    label=f"Name of the {selected_role}",
                    width=350,
                    border_color=PRIMARY_GREEN,
                    focused_border_color=DARK_GREEN,
                )
                additional_field_container.controls.append(org_name_field)
            
            additional_field_container.update()
        
        role_dropdown = ft.Dropdown(
            label="Primary Role",
            width=350,
            border_color=PRIMARY_GREEN,
            focused_border_color=DARK_GREEN,
            options=[
                ft.dropdown.Option("Individual"),
                ft.dropdown.Option("Restaurant/Caterer"),
                ft.dropdown.Option("Hostel/Mess"),
                ft.dropdown.Option("Others"),
            ],
        )
        role_dropdown.on_change = on_role_change
        
        agreement_checkbox = ft.Checkbox(
            label="I hereby agree that the information entered is to the best of my knowledge.",
            value=False,
        )

        agreement_row = ft.Row(
            controls=[agreement_checkbox],
            alignment=ft.MainAxisAlignment.CENTER,
        )
        
        proceed_button = ft.ElevatedButton(
            content=ft.Text(value="Proceed", color=WHITE),
            width=350,
            height=50,
            bgcolor=PRIMARY_GREEN,
            on_click=lambda _: self.handle_donor_signup(
                name_field.value,
                mobile_field.value,
                password_field.value,
                state_dropdown.value,
                district_field.value,
                city_field.value,
                pincode_field.value,
                role_dropdown.value,
                additional_field_container,
                agreement_checkbox.value,
            ),
        )
        
        back_button = ft.TextButton(
            content=ft.Text(value="← Back", color=PRIMARY_BLUE, size=14),
            on_click=lambda _: self.show_role_selection(),
        )
        
        form_column = ft.Column(
            controls=[
                ft.Container(height=20),
                back_button,
                ft.Container(height=10),
                title,
                ft.Container(height=30),
                name_field,
                ft.Container(height=20),
                mobile_field,
                ft.Container(height=20),
                password_field,
                ft.Container(height=20),
                state_dropdown,
                ft.Container(height=20),
                district_field,
                ft.Container(height=20),
                city_field,
                ft.Container(height=20),
                pincode_field,
                ft.Container(height=20),
                role_dropdown,
                ft.Container(height=20),
                additional_field_container,
                ft.Container(height=20),
                agreement_row,
                ft.Container(height=30),
                proceed_button,
                ft.Container(height=40),
            ],
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            scroll=ft.ScrollMode.ADAPTIVE,
            expand=True,
        )
        
        signup_container = ft.Container(
            content=form_column,
            padding=20,
            expand=True,
        )
        
        self.page.add(signup_container)
        self.page.update()

    def handle_donor_signup(self, name, mobile, password, state, district, city, pincode, role, additional_container, agreement):
        """Handle donor signup form submission"""
        if not all([name, mobile, password, state, district, city, pincode, role]):
            snack = ft.SnackBar(content=ft.Text("Please fill in all fields"), bgcolor="#f44336")
            self.page.overlay.append(snack)
            snack.open = True
            self.page.update()
            return
        
        if not agreement:
            snack = ft.SnackBar(content=ft.Text("Please agree to the terms"), bgcolor="#f44336")
            self.page.overlay.append(snack)
            snack.open = True
            self.page.update()
            return
        
        additional_info = None
        if additional_container.controls:
            additional_info = additional_container.controls[0].value
            if not additional_info:
                snack = ft.SnackBar(content=ft.Text("Please fill in the additional field"), bgcolor="#f44336")
                self.page.overlay.append(snack)
                snack.open = True
                self.page.update()
                return
        
        if not re.match(r'^\d{10}$', mobile):
            snack = ft.SnackBar(content=ft.Text("Please enter a valid 10-digit mobile number"), bgcolor="#f44336")
            self.page.overlay.append(snack)
            snack.open = True
            self.page.update()
            return
        
        if not re.match(r'^\d{6}$', pincode):
            snack = ft.SnackBar(content=ft.Text("Please enter a valid 6-digit pincode"), bgcolor="#f44336")
            self.page.overlay.append(snack)
            snack.open = True
            self.page.update()
            return
        
        if db:
            try:
                donor_data = {
                    "name": name,
                    "mobile": mobile,
                    "password": password,
                    "state": state,
                    "district": district,
                    "city": city,
                    "pincode": pincode,
                    "role": role,
                    "additional_info": additional_info,
                    "user_type": "donor",
                    "created_at": datetime.now(),
                }
                
                db.collection("users").document(mobile).set(donor_data)
                
                snack = ft.SnackBar(content=ft.Text("Registration successful!"), bgcolor=PRIMARY_GREEN)
                self.page.overlay.append(snack)
                snack.open = True
                self.page.update()
                
                self.show_login_page()
                
            except Exception as e:
                snack = ft.SnackBar(content=ft.Text(f"Error: {str(e)}"), bgcolor="#f44336")
                self.page.overlay.append(snack)
                snack.open = True
                self.page.update()
        else:
            snack = ft.SnackBar(content=ft.Text("Registration successful! (Firebase not connected)"), bgcolor=PRIMARY_GREEN)
            self.page.overlay.append(snack)
            snack.open = True
            self.page.update()
            self.show_login_page()

    def show_donor_dashboard(self):
        """Display donor dashboard page"""
        self.page.clean()
        
        # --- Top Bar ---
        top_bar = ft.Container(
            content=ft.Row(
                controls=[
                    # ≡ Sidebar button
                    ft.ElevatedButton(
                        content=ft.Container(
                            content=ft.Text("≡", size=25),
                            alignment=ft.alignment.Alignment(0,-2),
                            width=40,
                            height=40,
                        ),
                        style=ft.ButtonStyle(shape=ft.CircleBorder()),
                        on_click=lambda _: print("Sidebar clicked"),
                    ),
                    # App title + logo
                    ft.Row(
                        controls=[
                            ft.Image(
                                src="logo.png",
                                width=40,
                                height=40,
                            ),
                            ft.Image(
                                src="name.png",
                                width=160,
                                height=160,
                            )
                        ],
                        spacing=4,
                    ),
                    # Profile + notification buttons
                    ft.Row(
                        controls=[
                            # Notification button
                            ft.ElevatedButton(
                                content=ft.Container(
                                    content=ft.Text(self.current_user[0] if self.current_user else "U", size=25, color="#2ECC71"),
                                    alignment=ft.alignment.Alignment(0, 0),
                                    width=40,
                                    height=40,
                                ),
                                style=ft.ButtonStyle(shape=ft.CircleBorder()),
                                on_click=lambda _: print("Notifications clicked"),
                            ),
                        ],
                        spacing=3,
                    ),
                ],
                alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            ),
            padding=ft.padding.only(left=15, right=15, top=10, bottom=10),
        )
        
        welcome_text = ft.Container(
            content=ft.Column(
                controls=[
                    ft.Text(
                        value=f"Hey! {self.current_user if self.current_user else 'XYZ'}",
                        size=32,
                        weight=ft.FontWeight.BOLD,
                        color="#2C3E2C",
                    ),
                    ft.Text(
                        value="Welcome to RePlate!",
                        size=16,
                        color="#2C3E2C",
                    ),
                ],
                spacing=5,
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            ),
            padding=ft.padding.only(top=30, bottom=20),
        )
        
        # First card row - Create New Donation & Donation History
        first_card = ft.Container(
            content=ft.Row(
                controls=[
                    ft.Container(
                        content=ft.Column(
                            controls=[
                                ft.Container(
                                    content=ft.Image(
                                        src="create_donation_icon.png",
                                        width=85,
                                        height=85,
                                    ),
                                ),
                                ft.Text(
                                    value="Create New Donation",
                                    size=13,
                                    weight=ft.FontWeight.W_600,
                                    color="#2C3E2C",
                                    text_align=ft.TextAlign.CENTER,
                                ),
                            ],
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=5,
                        ),
                        width=172,
                        height=145,
                        bgcolor=WHITE,
                        border_radius=20,
                        padding=20,
                        on_click=lambda _: print("Create New Donation clicked"),
                    ),
                    ft.Container(
                        content=ft.Column(
                            controls=[
                                ft.Container(
                                    content=ft.Image(
                                        src="donation_history_icon.png",
                                        width=85,
                                        height=85,
                                    ),
                                ),
                                ft.Text(
                                    value="Donation History",
                                    size=13,
                                    weight=ft.FontWeight.W_600,
                                    color="#2C3E2C",
                                    text_align=ft.TextAlign.CENTER,
                                ),
                            ],
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=5,
                        ),
                        width=172,
                        height=145,
                        bgcolor=WHITE,
                        border_radius=20,
                        padding=20,
                        on_click=lambda _: print("Donation History clicked"),
                    ),
                ],
                alignment=ft.MainAxisAlignment.CENTER,
                spacing=15,
            ),
            margin=ft.margin.only(top=20),
        )
        
        # Second card row - View Donation Status & View Dashboard
        second_card = ft.Container(
            content=ft.Row(
                controls=[
                    ft.Container(
                        content=ft.Column(
                            controls=[
                                ft.Container(
                                    content=ft.Image(
                                        src="view_status_icon.png",
                                        width=85,
                                        height=85,
                                    ),
                                ),
                                ft.Text(
                                    value="View Donation Status",
                                    size=13,
                                    weight=ft.FontWeight.W_600,
                                    color="#2C3E2C",
                                    text_align=ft.TextAlign.CENTER,
                                ),
                            ],
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=9,
                        ),
                        width=172,
                        height=145,
                        bgcolor=WHITE,
                        border_radius=20,
                        padding=20,
                        on_click=lambda _: print("View Donation Status clicked"),
                    ),
                    ft.Container(
                        content=ft.Column(
                            controls=[
                                ft.Container(
                                    content=ft.Image(
                                        src="dashboard_icon.png",
                                        width=85,
                                        height=85,
                                    ),
                                ),
                                ft.Text(
                                    value="View Dashboard",
                                    size=13,
                                    weight=ft.FontWeight.W_600,
                                    color="#2C3E2C",
                                    text_align=ft.TextAlign.CENTER,
                                ),
                            ],
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=9,
                        ),
                        width=172,
                        height=145,
                        bgcolor=WHITE,
                        border_radius=20,
                        padding=20,
                        on_click=lambda _: print("Donation History clicked"),
                    ),
                ],
                alignment=ft.MainAxisAlignment.CENTER,
                spacing=15,
            ),
            margin=ft.margin.only(top=20),
        )
        
        search_bar = ft.Container(
            content=ft.TextField(
                hint_text="Search for NGOS...",
                border=ft.InputBorder.NONE,
                text_size=14,
                prefix_icon="search",
                bgcolor="transparent",
            ),
            bgcolor=WHITE,
            border_radius=25,
            padding=ft.padding.only(left=10, right=10, top=5, bottom=5),
            width=350,
        )
        
        rewards_badges_row = ft.Row(
            controls=[
                ft.Container(
                    content=ft.Column(
                        controls=[
                            ft.Container(
                                content=ft.Image(
                                    src="rewards_icon.png",
                                    width=48,
                                    height=58,
                                ),
                            ),
                            ft.Text(
                                value="Rewards",
                                size=14,
                                color="#2C3E2C",
                            ),
                        ],
                        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                        spacing=0.1,
                    ),
                    width=95,
                    height=105,
                    bgcolor=WHITE,
                    border_radius=25,
                    padding=10,
                    on_click=lambda _: print("Rewards clicked"),
                ),
                ft.Container(
                    content=ft.Column(
                        controls=[
                            ft.Container(
                                content=ft.Image(
                                    src="badges_icon.png",
                                    width=48,
                                    height=58,
                                ),
                            ),
                            ft.Text(
                                value="Badges",
                                size=14,
                                color="#2C3E2C",
                            ),
                        ],
                        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                        spacing=0.1,
                    ),
                    width=95,
                    height=105,
                    bgcolor=WHITE,
                    border_radius=25,
                    padding=10,
                    on_click=lambda _: print("Badges clicked"),
                ),
            ],
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=15,
        )
        
        guidelines_button = ft.Container(
            height=60,
            width=350,
            content=ft.Row(
                controls=[
                    ft.Container(
                        content=ft.Image(
                            src="guidelines_icon.png",
                            width=40,
                            height=40,
                        ),
                    ),
                    ft.Text(
                        value="Guidelines",
                        size=17,
                        weight=ft.FontWeight.W_500,
                        color="#2C3E2C",
                    ),
                ],
                spacing=10,
            ),
            bgcolor=WHITE,
            border_radius=15,
            padding=ft.padding.symmetric(horizontal=20, vertical=10),
            on_click=lambda _: print("Guidelines clicked"),
        )

        # --- Footer Section ---
        footer = ft.Container(
            content=ft.Column(
                controls=[
                    ft.Row(
                        controls=[
                            ft.Text("Conditions of Use    Privacy Notice", size=11, color="#4a5c4a"),
                            ft.Text("Consumer Health Data Privacy Disclosure", size=11, color="#4a5c4a"),
                            ft.Text("Your Ads Privacy Choices", size=11, color="#4a5c4a"),
                        ],
                        alignment=ft.MainAxisAlignment.CENTER,
                        run_alignment=ft.MainAxisAlignment.CENTER,
                        wrap=True,
                        spacing=15,
                        run_spacing=5,
                    ),
                    ft.Container(height=5),
                    ft.Text(
                        "© 2025-Now, replate.com, inc. or its affiliates",
                        size=10,
                        color="#2C3E2C",
                        text_align=ft.TextAlign.CENTER,
                        weight=ft.FontWeight.W_500,
                    ),
                ],
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                spacing=5,
            ),
            padding=ft.padding.only(top=10, bottom=20, left=20, right=20),
        )
        
        main_content = ft.Column(
            controls=[
                top_bar,
                welcome_text,
                first_card,
                ft.Container(height=20),
                second_card,
                ft.Container(height=20),
                search_bar,
                ft.Container(height=20),
                rewards_badges_row,
                ft.Container(height=20),
                guidelines_button,
                ft.Container(height=30),
                footer,
            ],
            spacing=0,
            scroll=ft.ScrollMode.ADAPTIVE,
            expand=True,
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        )
        
        dashboard_container = ft.Container(
            content=main_content,
            gradient=ft.LinearGradient(
                begin=ft.Alignment(-1, -1),
                end=ft.Alignment(1, 1),
                colors=["#B8D4B8", "#A8C9C9", "#98BED8"],
            ),
            expand=True,
        )
        
        self.page.add(dashboard_container)
        self.page.update()

    def handle_login(self, username, password):
        """Handle login logic"""
        if username and password:
            self.current_user = username
            self.user_role = "donor"
            self.show_donor_dashboard()
        else:
            snack = ft.SnackBar(
                content=ft.Text("Please enter username and password"),
                bgcolor="#f44336",
            )
            self.page.overlay.append(snack)
            snack.open = True
            self.page.update()

    def show_receiver_signup(self):
        """Placeholder for receiver signup"""
        print("Receiver signup not implemented yet")


def main(page: ft.Page):
    RePlateApp(page)


ft.app(target=main)
