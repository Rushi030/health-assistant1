#!/usr/bin/env python3
"""
Database Viewer for Health Assistant
View all data in a formatted way
"""

import sqlite3
from datetime import datetime
from tabulate import tabulate

DATABASE = 'health_assistant.db'

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def view_users():
    """Display all users"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, email, age, bio, created_at FROM users")
    users = cursor.fetchall()
    
    if users:
        headers = ["ID", "Name", "Email", "Age", "Bio", "Created At"]
        rows = [[u["id"], u["name"], u["email"], u["age"] or "N/A", 
                 (u["bio"][:30] + "...") if len(u["bio"] or "") > 30 else u["bio"] or "N/A",
                 u["created_at"]] for u in users]
        
        print(tabulate(rows, headers=headers, tablefmt="grid"))
        print(f"\n📊 Total Users: {len(users)}")
    else:
        print("❌ No users found")
    
    conn.close()

def view_appointments():
    """Display all appointments"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT a.id, a.user_email, u.name as user_name, a.doctor, 
               a.date, a.time, a.booked_at 
        FROM appointments a
        LEFT JOIN users u ON a.user_email = u.email
        ORDER BY a.date, a.time
    """)
    appointments = cursor.fetchall()
    
    if appointments:
        headers = ["ID", "User", "Email", "Doctor", "Date", "Time", "Booked At"]
        rows = [[a["id"], a["user_name"] or "Unknown", a["user_email"], 
                 a["doctor"], a["date"], a["time"], a["booked_at"]] 
                for a in appointments]
        
        print(tabulate(rows, headers=headers, tablefmt="grid"))
        print(f"\n📅 Total Appointments: {len(appointments)}")
    else:
        print("❌ No appointments found")
    
    conn.close()

def view_stats():
    """Display database statistics"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # User count
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    
    # Appointment count
    cursor.execute("SELECT COUNT(*) FROM appointments")
    appt_count = cursor.fetchone()[0]
    
    # Today's appointments
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT COUNT(*) FROM appointments WHERE date = ?", (today,))
    today_count = cursor.fetchone()[0]
    
    # Most active user
    cursor.execute("""
        SELECT u.name, u.email, COUNT(a.id) as appt_count
        FROM users u
        LEFT JOIN appointments a ON u.email = a.user_email
        GROUP BY u.email
        ORDER BY appt_count DESC
        LIMIT 1
    """)
    most_active = cursor.fetchone()
    
    # Most booked doctor
    cursor.execute("""
        SELECT doctor, COUNT(*) as count
        FROM appointments
        GROUP BY doctor
        ORDER BY count DESC
        LIMIT 1
    """)
    popular_doctor = cursor.fetchone()
    
    # Display stats
    stats = [
        ["👥 Total Users", user_count],
        ["📅 Total Appointments", appt_count],
        ["🕐 Today's Appointments", today_count],
        ["⭐ Most Active User", f"{most_active[0]} ({most_active[2]} appointments)" if most_active and most_active[2] > 0 else "N/A"],
        ["👨‍⚕️ Most Booked Doctor", f"{popular_doctor[0]} ({popular_doctor[1]} bookings)" if popular_doctor else "N/A"]
    ]
    
    print(tabulate(stats, headers=["Metric", "Value"], tablefmt="fancy_grid"))
    
    conn.close()

def view_recent_activity():
    """Display recent activity"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Recent signups
    cursor.execute("""
        SELECT name, email, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
    """)
    recent_users = cursor.fetchall()
    
    # Recent appointments
    cursor.execute("""
        SELECT u.name, a.doctor, a.date, a.time, a.booked_at
        FROM appointments a
        JOIN users u ON a.user_email = u.email
        ORDER BY a.booked_at DESC
        LIMIT 5
    """)
    recent_appts = cursor.fetchall()
    
    print("\n🆕 Recent Signups:")
    if recent_users:
        headers = ["Name", "Email", "Joined"]
        rows = [[u["name"], u["email"], u["created_at"]] for u in recent_users]
        print(tabulate(rows, headers=headers, tablefmt="simple"))
    else:
        print("  No users yet")
    
    print("\n📅 Recent Appointments:")
    if recent_appts:
        headers = ["User", "Doctor", "Date", "Time", "Booked"]
        rows = [[a["name"], a["doctor"], a["date"], a["time"], a["booked_at"]] 
                for a in recent_appts]
        print(tabulate(rows, headers=headers, tablefmt="simple"))
    else:
        print("  No appointments yet")
    
    conn.close()

def search_user(email):
    """Search for a specific user"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if user:
        print(f"\n👤 User Details:")
        print(f"  ID: {user['id']}")
        print(f"  Name: {user['name']}")
        print(f"  Email: {user['email']}")
        print(f"  Age: {user['age'] or 'Not set'}")
        print(f"  Bio: {user['bio'] or 'Not set'}")
        print(f"  Joined: {user['created_at']}")
        
        # Get user's appointments
        cursor.execute("""
            SELECT * FROM appointments 
            WHERE user_email = ?
            ORDER BY date, time
        """, (email,))
        appointments = cursor.fetchall()
        
        print(f"\n📅 Appointments ({len(appointments)}):")
        if appointments:
            headers = ["ID", "Doctor", "Date", "Time"]
            rows = [[a["id"], a["doctor"], a["date"], a["time"]] for a in appointments]
            print(tabulate(rows, headers=headers, tablefmt="simple"))
        else:
            print("  No appointments")
    else:
        print(f"❌ User not found: {email}")
    
    conn.close()

def interactive_menu():
    """Interactive menu for database viewing"""
    while True:
        print("\n" + "=" * 80)
        print("  🏥 Health Assistant - Database Viewer")
        print("=" * 80)
        print("\n  Options:")
        print("  1. View All Users")
        print("  2. View All Appointments")
        print("  3. View Statistics")
        print("  4. View Recent Activity")
        print("  5. Search User by Email")
        print("  6. Exit")
        
        choice = input("\n  Enter choice (1-6): ").strip()
        
        if choice == "1":
            print_section("ALL USERS")
            view_users()
        elif choice == "2":
            print_section("ALL APPOINTMENTS")
            view_appointments()
        elif choice == "3":
            print_section("DATABASE STATISTICS")
            view_stats()
        elif choice == "4":
            print_section("RECENT ACTIVITY")
            view_recent_activity()
        elif choice == "5":
            email = input("\n  Enter email: ").strip()
            search_user(email)
        elif choice == "6":
            print("\n  👋 Goodbye!\n")
            break
        else:
            print("\n  ❌ Invalid choice. Please try again.")
        
        input("\n  Press Enter to continue...")

def main():
    """Main function"""
    try:
        # Check if database exists
        conn = sqlite3.connect(DATABASE)
        conn.close()
        
        # Run interactive menu
        interactive_menu()
        
    except sqlite3.OperationalError:
        print(f"\n❌ Error: Database '{DATABASE}' not found!")
        print("   Make sure the Flask app has been run at least once.")
        print("   Run: python app.py\n")
    except KeyboardInterrupt:
        print("\n\n  👋 Goodbye!\n")
    except Exception as e:
        print(f"\n❌ Error: {e}\n")

if __name__ == "__main__":
    # Check if tabulate is installed
    try:
        import tabulate
    except ImportError:
        print("\n⚠️  Installing required package 'tabulate'...")
        import subprocess
        subprocess.check_call(["pip", "install", "tabulate"])
        print("✅ Installation complete!\n")
        import tabulate
    
    main()