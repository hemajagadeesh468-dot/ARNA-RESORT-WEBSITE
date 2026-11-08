from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash
import sqlite3
import os

app = Flask(__name__)

CORS(app)

# Database location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "database.db")


# Connect to the database
def get_database():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


# Create database tables
def create_database():
    connection = get_database()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            check_in TEXT NOT NULL,
            check_out TEXT NOT NULL,
            guests INTEGER NOT NULL,
            room TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()

# Booking API
@app.route("/api/bookings", methods=["POST"])
def create_booking():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    check_in = data.get("check_in", "")
    check_out = data.get("check_out", "")
    guests = data.get("guests")
    room = data.get("room", "").strip()

    # Check required fields
    if not all([name, email, check_in, check_out, guests, room]):
        return jsonify({
            "success": False,
            "message": "Please fill in all booking details."
        }), 400

    # Validate email
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    # Validate dates
    if check_out <= check_in:
        return jsonify({
            "success": False,
            "message": "Check-out date must be after check-in date."
        }), 400

    # Validate number of guests
    try:
        guests = int(guests)

        if guests < 1:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Number of guests must be at least 1."
        }), 400

    connection = get_database()

    try:
        connection.execute(
            """
            INSERT INTO bookings
            (name, email, check_in, check_out, guests, room)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (name, email, check_in, check_out, guests, room)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Your booking has been saved successfully!"
        }), 201

    finally:
        connection.close()

# Contact Message API
@app.route("/api/contact", methods=["POST"])
def save_contact_message():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    # Check required fields
    if not name or not email or not subject or not message:
        return jsonify({
            "success": False,
            "message": "Please fill in all fields."
        }), 400

    # Validate email
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    connection = get_database()

    try:
        connection.execute(
            """
            INSERT INTO contact_messages (name, email, message)
            VALUES (?, ?, ?)
            """,
            (name, email, subject + "\n\n" + message)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Your message has been sent successfully!"
        }), 201

    finally:
        connection.close()

# View Bookings API
@app.route("/api/bookings", methods=["GET"])
def get_bookings():

    email = request.args.get("email", "").strip().lower()

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required."
        }), 400

    connection = get_database()

    try:
        rows = connection.execute(
            """
            SELECT id, name, email, check_in, check_out, guests, room
            FROM bookings
            WHERE LOWER(email) = ?
            ORDER BY id DESC
            """,
            (email,)
        ).fetchall()

        bookings = [dict(row) for row in rows]

        return jsonify({
            "success": True,
            "bookings": bookings
        }), 200

    finally:
        connection.close()

# Submit a Review API
@app.route("/api/reviews", methods=["POST"])
def submit_review():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    rating = data.get("rating")
    message = data.get("message", "").strip()

    # Check required fields
    if not name or not rating or not message:
        return jsonify({
            "success": False,
            "message": "Please fill in all review fields."
        }), 400

    # Validate rating
    try:
        rating = int(rating)

        if rating < 1 or rating > 5:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Please select a rating from 1 to 5."
        }), 400

    connection = get_database()

    try:
        # Create the reviews table if it does not exist
        connection.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rating INTEGER NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.execute(
            """
            INSERT INTO reviews (name, rating, message)
            VALUES (?, ?, ?)
            """,
            (name, rating, message)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Thank you! Your review has been submitted."
        }), 201

    finally:
        connection.close()


# Get Reviews API
@app.route("/api/reviews", methods=["GET"])
def get_reviews():

    connection = get_database()

    try:
        # Create table if it does not exist
        connection.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rating INTEGER NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()

        rows = connection.execute(
            """
            SELECT id, name, rating, message, created_at
            FROM reviews
            ORDER BY id DESC
            """
        ).fetchall()

        return jsonify({
            "success": True,
            "reviews": [dict(row) for row in rows]
        }), 200

    finally:
        connection.close()

# Test the backend
@app.route("/")
def home():
    return "Arna Resort Backend is Running!"


# Signup API
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Check for empty fields
    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Please fill in all fields."
        }), 400

    # Validate email
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    # Validate password
    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 6 characters."
        }), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(password)

    connection = get_database()

    try:
        connection.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
            """,
            (name, email, hashed_password)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Account created successfully!"
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({
            "success": False,
            "message": "This email is already registered."
        }), 409

    finally:
        connection.close()


# Login API
@app.route("/api/login", methods=["POST"])
def login():
    from werkzeug.security import check_password_hash

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Please enter your email and password."
        }), 400

    connection = get_database()

    try:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if user is None or not check_password_hash(
            user["password"], password
        ):
            return jsonify({
                "success": False,
                "message": "Incorrect email or password."
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": {
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

    finally:
        connection.close()

if __name__ == "__main__":
    create_database()
    app.run(debug=True)

