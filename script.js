/* Paradise Retreat - Short JavaScript */

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const emailOK = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);



    /* ==================== OLD BOOKING FORM ==================== */

    const booking = $("#booking-page");

    if (booking) {
        const button = $("button", booking);

        if (button) {
            button.onclick = () => {
                const inputs = $$("input", booking);
                const room = $("select", booking);

                const [name, email, checkIn, checkOut, guests] =
                    inputs.map(x => x.value.trim());

                if (
                    !name ||
                    !email ||
                    !checkIn ||
                    !checkOut ||
                    !guests ||
                    !room.value ||
                    room.value === "Select a room"
                ) {
                    return alert("Please fill in all booking details.");
                }

                if (!emailOK(email)) {
                    return alert("Please enter a valid email address.");
                }

                if (new Date(checkOut) <= new Date(checkIn)) {
                    return alert(
                        "Check-out date must be after check-in date."
                    );
                }

                localStorage.setItem(
                    "resortBooking",
                    JSON.stringify({
                        name,
                        email,
                        checkIn,
                        checkOut,
                        guests,
                        room: room.value
                    })
                );

                alert("Booking confirmed successfully!");
            };
        }
    }


    /* ==================== OLD CONTACT FORM ==================== */

    const contact = $(".contact-form form");

    if (contact) {
        contact.onsubmit = e => {
            e.preventDefault();

            const inputs = $$("input", contact);
            const message = $("textarea", contact);

            const name = inputs[0].value.trim();
            const email = inputs[1].value.trim();

            if (!name || !email || !message.value.trim()) {
                return alert("Please fill in all contact details.");
            }

            if (!emailOK(email)) {
                return alert("Please enter a valid email address.");
            }

            localStorage.setItem(
                "contactMessage",
                JSON.stringify({
                    name,
                    email,
                    subject: inputs[2]?.value.trim(),
                    message: message.value.trim()
                })
            );

            alert("Your message has been sent successfully!");

            contact.reset();
        };
    };


/* ==================== ACTIVITIES ==================== */

function showActivity(key) {

    const button = $$(".activity-card button")
        .find(x => x.getAttribute("onclick")?.includes("'" + key + "'"));

    const card = button?.closest(".activity-card");

    if (!card) {
        return alert("Activity information is not available.");
    }

    const title = $("h3", card)?.textContent || key;
    const description = $("p", card)?.textContent || "";

    document.querySelector(".activity-popup")?.remove();

    const popup = document.createElement("div");
    popup.className = "activity-popup";

    popup.innerHTML = `
        <div class="activity-popup-content">

            <button class="activity-close">&times;</button>

            <h2>${title}</h2>

            <p>${description}</p>

            <h4>Experience</h4>
            <p>
                Enjoy a memorable ${title.toLowerCase()}
                experience at Paradise Retreat.
            </p>

            <h4>Suitable For</h4>
            <p>
                Families, couples, friends and individual guests.
            </p>

            <h4>Important</h4>
            <p>
                Follow resort safety instructions during the activity.
            </p>

            <button class="activity-close-button">
                Close
            </button>

        </div>
    `;

    document.body.append(popup);

    $$(".activity-close, .activity-close-button", popup)
        .forEach(button => {
            button.onclick = () => popup.remove();
        });

    popup.onclick = e => {
        if (e.target === popup) {
            popup.remove();
        }
    };
}

/* ==================== GALLERY ==================== */
// ADD PHOTO TO GALLERY

const galleryPhotoInput = document.getElementById("galleryPhotoInput");

if (galleryPhotoInput) {
    galleryPhotoInput.addEventListener("change", function () {
        const files = Array.from(this.files);
        const gallery = document.querySelector(".gallery-container");

        if (!gallery) return;

        files.forEach(function (file) {
            if (!file.type.startsWith("image/")) return;

            const imageURL = URL.createObjectURL(file);

            const galleryItem = document.createElement("div");
            galleryItem.className = "gallery-item";

            const image = document.createElement("img");
            image.src = imageURL;
            image.alt = file.name;

            galleryItem.appendChild(image);
            gallery.appendChild(galleryItem);
        });

        this.value = "";
    });
}
/* ==================== PROFILE ==================== */

function loadProfile() {

    const profile =
        JSON.parse(localStorage.getItem("resortProfile") || "null");

    const card = $(".profile-card");

    if (!profile || !card) {
        return;
    }

    $("h3", card).textContent = profile.name;

    $("#profile-email").textContent = profile.email;
    $("#profile-phone").textContent = profile.phone;
    $("#profile-location").textContent = profile.location;

    updateCompletion(profile);
}


function updateCompletion(profile) {

    const filled =
        ["name", "email", "phone", "location"]
            .filter(key => profile[key]?.trim()).length;

    const percent = filled * 25;

    if ($("#completion-percent")) {
        $("#completion-percent").textContent = percent + "%";
    }

    if ($("#progress-fill")) {
        $("#progress-fill").style.width = percent + "%";
    }
}


function loadPhoto() {

    const icon = $(".profile-icon");

    if (!icon) {
        return;
    }

    const photo = localStorage.getItem("profilePhoto");
    const avatar = localStorage.getItem("profileAvatar");

    icon.innerHTML = photo
        ? `<img src="${photo}" alt="Profile Photo">`
        : avatar || "👤";
}


/* ==================== EDIT PROFILE ==================== */

function editProfile() {

    const profile =
        JSON.parse(localStorage.getItem("resortProfile") || "{}");

    document.querySelector(".profile-edit-popup")?.remove();

    const popup = document.createElement("div");
    popup.className = "profile-edit-popup";

    popup.innerHTML = `
        <div class="profile-edit-content">

            <button class="profile-close">&times;</button>

            <h2>Edit Profile</h2>

            <div class="edit-photo-section">

                <div class="edit-photo-preview">👤</div>

                <h4>Choose Avatar</h4>

                <div class="avatar-options">
                    ${["👤", "👨", "👩", "🧑", "👨‍💼", "👩‍💼"]
                        .map(a => `
                            <button class="avatar-option"
                                data-avatar="${a}">
                                ${a}
                            </button>
                        `).join("")}
                </div>

                <label
                    for="profile-photo"
                    class="choose-photo-button">
                    Choose Photo
                </label>

                <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    hidden>

                <button
                    id="remove-photo"
                    class="remove-photo-button">
                    Remove Photo
                </button>

            </div>

            <input
                id="edit-name"
                value="${profile.name || "Guest User"}"
                placeholder="Name">

            <input
                id="edit-email"
                value="${profile.email || "guest@example.com"}"
                placeholder="Email">

            <input
                id="edit-phone"
                value="${profile.phone || "+91 98765 43210"}"
                placeholder="Phone">

            <input
                id="edit-location"
                value="${profile.location || "Karnataka"}"
                placeholder="Location">

            <button
                id="save-profile"
                class="save-profile-button">
                Save Changes
            </button>

        </div>
    `;

    document.body.append(popup);

    const preview = $(".edit-photo-preview", popup);
    const fileInput = $("#profile-photo", popup);

    $(".profile-close", popup).onclick = () => popup.remove();

    $("#remove-photo", popup).onclick = () => {
        preview.innerHTML = "👤";
        preview.dataset.type = "";
        preview.dataset.value = "";
        fileInput.value = "";
    };

    $$(".avatar-option", popup).forEach(button => {
        button.onclick = () => {
            preview.textContent = button.dataset.avatar;
            preview.dataset.type = "avatar";
            preview.dataset.value = button.dataset.avatar;
            fileInput.value = "";
        };
    });

    fileInput.onchange = () => {
        const file = fileInput.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            return alert("Please choose an image file.");
        }

        const reader = new FileReader();

        reader.onload = () => {
            preview.innerHTML =
                `<img src="${reader.result}" alt="Profile Photo">`;

            preview.dataset.type = "photo";
            preview.dataset.value = reader.result;
        };

        reader.readAsDataURL(file);
    };

    $("#save-profile", popup).onclick = saveProfile;
}


/* ==================== SAVE PROFILE ==================== */

function saveProfile() {

    const profile = {
        name: $("#edit-name").value.trim(),
        email: $("#edit-email").value.trim(),
        phone: $("#edit-phone").value.trim(),
        location: $("#edit-location").value.trim()
    };

    const preview = $(".edit-photo-preview");

    if (Object.values(profile).some(value => !value)) {
        return alert("Please fill in all fields.");
    }

    if (!emailOK(profile.email)) {
        return alert("Please enter a valid email address.");
    }

    localStorage.setItem("resortProfile", JSON.stringify(profile));

    if (preview.dataset.type === "photo") {
        localStorage.setItem("profilePhoto", preview.dataset.value);
        localStorage.removeItem("profileAvatar");
    } else if (preview.dataset.type === "avatar") {
        localStorage.setItem("profileAvatar", preview.dataset.value);
        localStorage.removeItem("profilePhoto");
    } else {
        localStorage.removeItem("profilePhoto");
        localStorage.removeItem("profileAvatar");
    }

    loadProfile();
    loadPhoto();

    document.querySelector(".profile-edit-popup")?.remove();

    alert("Profile updated successfully!");
}


/* ==================== SETTINGS ==================== */

function openSettings() {

    document.querySelector(".settings-popup")?.remove();

    const popup = document.createElement("div");
    popup.className = "settings-popup";

    popup.innerHTML = `
        <div class="settings-content">

            <button class="settings-close">&times;</button>

            <h2>Account Settings</h2>

            <div class="setting-item">
                <span>🔐 Change Password</span>
                <button onclick="changePassword()">Change</button>
            </div>

            <div class="setting-item">
                <span>🔔 Notifications</span>
                <button onclick="toggleNotifications()">On</button>
            </div>

            <div class="setting-item">
                <span>🔒 Privacy</span>
                <button onclick="showPrivacy()">View</button>
            </div>

        </div>
    `;

    document.body.append(popup);

    $(".settings-close", popup).onclick = () => popup.remove();

    popup.onclick = e => {
        if (e.target === popup) {
            popup.remove();
        }
    };
}


function changePassword() {
    alert("Password changing will be connected to the Java backend later.");
}


function toggleNotifications() {
    alert("Notification settings will be connected to the backend later.");
}


function showPrivacy() {
    alert("Your profile information is currently stored locally in your browser.");
}


/* ==================== LOGOUT ==================== */

function logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInEmail");
    location.href = "login.html";
}


/* ==================== START PROFILE ==================== */

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadPhoto();
});


/* ==================== BOOKING DATABASE ==================== */

const bookingForm = document.getElementById("booking-form");

if (bookingForm) {

    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");

    const today = new Date();

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    if (checkInInput && checkOutInput) {

        checkInInput.min = todayString;
        checkOutInput.min = todayString;

        checkInInput.addEventListener("change", function () {

            checkOutInput.min = checkInInput.value;

            if (
                checkOutInput.value &&
                checkOutInput.value <= checkInInput.value
            ) {
                checkOutInput.value = "";
            }
        });
    }

    bookingForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("booking-name").value.trim();
        const email = document.getElementById("booking-email").value.trim();
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        const guests = document.getElementById("booking-guests").value;
        const room = document.getElementById("booking-room").value;

        if (!name || !email || !checkIn || !checkOut || !guests || !room) {
            alert("Please fill in all booking details.");
            return;
        }

        if (!emailOK(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (checkOut <= checkIn) {
            alert("Check-out date must be after check-in date.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/bookings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        check_in: checkIn,
                        check_out: checkOut,
                        guests: guests,
                        room: room
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                alert(result.message || "Booking failed.");
                return;
            }

            alert("Booking confirmed successfully!");

            bookingForm.reset();

            window.location.href = "home.html";

        } catch (error) {

            console.error("Booking error:", error);

            alert(
                "Cannot connect to Harna Resort. " +
                "Please check whether the backend is running."
            );
        }
    });
}


/* ==================== CONTACT DATABASE ==================== */

const contactForm = document.getElementById("contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const subject = document.getElementById("contact-subject").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (!name || !email || !subject || !message) {
            alert("Please fill in all fields.");
            return;
        }

        if (!emailOK(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        subject: subject,
                        message: message
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                alert(result.message || "Unable to send your message.");
                return;
            }

            alert("Thank you! Your message has been sent successfully.");

            contactForm.reset();

            window.location.href = "home.html";

        } catch (error) {

            console.error("Contact form error:", error);

            alert(
                "Cannot connect to Harna Resort. " +
                "Please check whether the backend is running."
            );
        }
    });
}


/* ==================== DISPLAY BOOKINGS ==================== */

const bookingsContainer = document.getElementById("bookings-container");

if (bookingsContainer) {

    async function loadBookings() {

        const email = localStorage.getItem("loggedInEmail");

        if (!email) {
            bookingsContainer.innerHTML =
                "<p>Please log in to view your bookings.</p>";
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/bookings?email=" +
                encodeURIComponent(email)
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                bookingsContainer.textContent =
                    result.message || "Unable to load bookings.";
                return;
            }

            if (result.bookings.length === 0) {
                bookingsContainer.innerHTML =
                    "<p>You have no bookings yet.</p>";
                return;
            }

            bookingsContainer.innerHTML = "";

            result.bookings.forEach(function (booking) {

                const card = document.createElement("div");
                card.className = "booking-card";

                const details = [
                    ["Guest", booking.name],
                    ["Email", booking.email],
                    ["Check-in", booking.check_in],
                    ["Check-out", booking.check_out],
                    ["Guests", booking.guests],
                    ["Room", booking.room]
                ];

                details.forEach(function (item) {

                    const paragraph = document.createElement("p");
                    const label = document.createElement("strong");

                    label.textContent = item[0] + ": ";

                    paragraph.appendChild(label);

                    paragraph.appendChild(
                        document.createTextNode(String(item[1]))
                    );

                    card.appendChild(paragraph);
                });

                bookingsContainer.appendChild(card);
            });

        } catch (error) {

            console.error("Bookings error:", error);

            bookingsContainer.textContent =
                "Cannot connect to Harna Resort. Please check the backend.";
        }
    }

    loadBookings();
}

// ========================================
// HARNA RESORT - REVIEWS SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const reviewForm = document.getElementById("review-form");
    const reviewModal = document.getElementById("review-modal");
    const openReviewButton = document.getElementById("open-review");
    const closeReviewButton = document.getElementById("close-review");
    const guestReviewsContainer = document.getElementById(
        "guest-reviews-container"
    );

    // Open review popup
    if (openReviewButton && reviewModal) {
        openReviewButton.addEventListener("click", function () {
            reviewModal.style.display = "flex";
        });
    }

    // Close review popup
    if (closeReviewButton && reviewModal) {
        closeReviewButton.addEventListener("click", function () {
            reviewModal.style.display = "none";
        });
    }

    // Close popup when clicking outside the form
    if (reviewModal) {
        reviewModal.addEventListener("click", function (event) {
            if (event.target === reviewModal) {
                reviewModal.style.display = "none";
            }
        });
    }

    // Display star rating
    function getStars(rating) {
        const value = Number(rating);
        return "★".repeat(value) + "☆".repeat(5 - value);
    }

    // Load reviews saved in the database
    async function loadGuestReviews() {

        if (!guestReviewsContainer) {
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/reviews"
            );

            if (!response.ok) {
                throw new Error("Unable to load reviews.");
            }

            const result = await response.json();

            guestReviewsContainer.replaceChildren();

            if (
                !result.success ||
                !Array.isArray(result.reviews) ||
                result.reviews.length === 0
            ) {
                const message = document.createElement("p");
                message.textContent = "No guest reviews submitted yet.";
                guestReviewsContainer.appendChild(message);
                return;
            }

            result.reviews.forEach(function (review) {

                const card = document.createElement("div");
                card.className = "review-card";

                const name = document.createElement("h3");
                name.textContent = review.name;

                const stars = document.createElement("p");
                stars.className = "stars";
                stars.textContent = getStars(review.rating);

                const message = document.createElement("p");
                message.textContent = review.message;

                card.appendChild(name);
                card.appendChild(stars);
                card.appendChild(message);

                guestReviewsContainer.appendChild(card);
            });

        } catch (error) {
            console.error("Error loading reviews:", error);

            guestReviewsContainer.replaceChildren();

            const message = document.createElement("p");
            message.textContent =
                "Unable to load reviews. Please check the backend.";

            guestReviewsContainer.appendChild(message);
        }
    }

    // Submit a new review
    if (reviewForm) {

        reviewForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const name = document
                .getElementById("review-name")
                .value.trim();

            const rating = document
                .getElementById("review-rating")
                .value;

            const message = document
                .getElementById("review-message")
                .value.trim();

            if (!name || !rating || !message) {
                alert("Please fill in all review fields.");
                return;
            }

            const submitButton = reviewForm.querySelector(
                ".submit-review-btn"
            );

            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            try {

                const response = await fetch(
                    "http://127.0.0.1:5000/api/reviews",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            rating: Number(rating),
                            message: message
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to submit review."
                    );
                }

                alert("Thank you! Your review has been submitted.");

                reviewForm.reset();

                if (reviewModal) {
                    reviewModal.style.display = "none";
                }

                // Refresh the list to show the newly submitted review
                await loadGuestReviews();

            } catch (error) {

                console.error("Error submitting review:", error);

                alert(
                    error.message ||
                    "Unable to submit your review. Please try again."
                );

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = "Submit Review";

            }

        });
    }

    // Load existing reviews when the page opens
    loadGuestReviews();

});
// LOGOUT FUNCTIONALITY
document.addEventListener("DOMContentLoaded", function () {

    const logoutButton = document.getElementById("logout-btn");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInEmail");
            localStorage.removeItem("resortUser");

            alert("You have been logged out successfully!");

            window.location.href = "welcomepage.html";
        });
    }

});
/* ==================== BASIC PAGE FUNCTIONS ==================== */

document.addEventListener("DOMContentLoaded", () => {

    // Welcome page
    if (location.pathname.endsWith("welcomepage.html")) {
        setTimeout(() => location.href = "login.html", 4000);
    }

    /* ==================== LOGIN ==================== */

    const login = $("#loginForm");

    if (login) {
        login.onsubmit = async e => {
            e.preventDefault();

            const [emailInput, passwordInput] =
                login.querySelectorAll("input");

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                return alert("Please enter your email and password.");
            }

            if (!emailOK(email)) {
                return alert("Please enter a valid email address.");
            }

            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/api/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    return alert(
                        result.message || "Login failed. Please try again."
                    );
                }

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("loggedInEmail", result.user.email);
                localStorage.setItem(
                    "resortUser",
                    JSON.stringify(result.user)
                );

                alert("Login successful!");

                window.location.replace("./home.html");

            } catch (error) {
                console.error("Login error:", error);

                alert(
                    "Cannot connect to Harna Resort. " +
                    "Please check whether the backend is running."
                );
            }
        };
    }


    /* ==================== SIGNUP ==================== */

    const signup = $("#signupForm");

    if (signup) {
        signup.onsubmit = async function (e) {
            e.preventDefault();

            const nameInput = signup.querySelector("#signupName");
            const emailInput = signup.querySelector("#signupEmail");
            const phoneInput = signup.querySelector("#signupPhone");
            const passwordInput = signup.querySelector("#signupPassword");
            const confirmInput = signup.querySelector("#confirmPassword");

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            if (!name || !email || !phone || !password || !confirm) {
                alert("Please fill in all fields.");
                return;
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                alert("Please enter a valid 10-digit mobile number.");
                return;
            }

            if (!emailOK(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            if (password.length < 10) {
                alert("Password must contain at least 10 characters.");
                return;
            }

            if (password !== confirm) {
                alert("Passwords do not match.");
                return;
            }

            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/api/signup",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    alert(result.message || "Signup failed.");
                    return;
                }

                const profile = {
                    name: name,
                    email: email,
                    phone: "+91 98765 43210",
                    location: "Karnataka"
                };

                localStorage.setItem(
                    "resortUser",
                    JSON.stringify({ name, email })
                );

                localStorage.setItem(
                    "resortProfile",
                    JSON.stringify(profile)
                );

                alert(result.message);
                window.location.replace("./login.html");

            } catch (error) {
                console.error("Signup error:", error);

                alert(
                    "Cannot connect to Harna Resort. " +
                    "Please check whether the backend is running."
                );
            }
        };
    };
});