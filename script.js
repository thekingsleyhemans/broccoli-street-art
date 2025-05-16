// Initialize Supabase
const supabaseUrl = "https://lxbfiwftjwfpsrdjxwfq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YmZpd2Z0andmcHNyZGp4d2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjY4MTMsImV4cCI6MjA1NzIwMjgxM30.Vg69HlP2myU0716i0nB7Mmd6_dxLRecLxixpSj7HWls";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function fetchAndRenderData() {
    try {
        // Fetch data from Supabase
        const { data: supabaseArtworks, error: artworksError } = await supabase
            .from("artworks")
            .select("*");

        const { data: supabaseArtists, error: artistsError } = await supabase
            .from("artists")
            .select("*");

        if (artworksError || artistsError) {
            console.error("Error fetching data from Supabase:", artworksError || artistsError);
        }

        // Fetch data from JSON files
        const [jsonArtworksResponse, jsonArtistsResponse] = await Promise.all([
            fetch("artworks.json"),
            fetch("artists.json"),
        ]);

        const jsonArtworks = await jsonArtworksResponse.json();
        const jsonArtists = await jsonArtistsResponse.json();

        // Combine Supabase and JSON data
        const artworks = [...(supabaseArtworks || []), ...jsonArtworks];
        const artists = [...(supabaseArtists || []), ...jsonArtists];

        // Populate Artworks Section
        const productsWrap = document.querySelector(".products-wrap");
        productsWrap.innerHTML = ""; // Clear static content

        artworks.forEach((art) => {
            const artist = artists.find((a) => a.id === art.artistId);
            const artistName = artist ? artist.name : "Unknown Artist";

            const card = document.createElement("div");
            card.classList.add("product-card");
            card.innerHTML = `
                <div class="card-img">
                    <img src="${art.image}" alt="${art.title}">
                </div>
                <div class="card-details">
                    <h3>${art.title}</h3>
                    <p>${art.price}</p>
                </div>
                <div class="artist-name">
                    <p><a href="artist-details.html?id=${artist?.id}" class="artist-link">${artistName}</a></p>
                </div>
                <div class="card-btns">
                    <a href="details.html?id=${art.id}" id="learn">LEARN MORE</a>
                    <a href="${art.paymentLink}" id="buy" target="_blank">BUY NOW</a>
                </div>
            `;
            productsWrap.appendChild(card);
        });

        // Populate Discover Artists Section
        const artistWrap = document.querySelector(".artist-wrap");
        artistWrap.innerHTML = ""; // Clear static artist cards

        artists.forEach((artist) => {
            const artistCard = document.createElement("div");
            artistCard.classList.add("artist-card");

            artistCard.innerHTML = `
                <div class="card-img">
                    <img src="${artist.image}" alt="${artist.name}">
                </div>
                <div class="card-details">
                    <h3>${artist.name}</h3>
                    <p>${artist.category}</p>
                </div>
                <div class="card-btns">
                    <a href="artist-details.html?id=${artist.id}" class="learn-more">LEARN MORE</a>
                </div>
            `;

            artistWrap.appendChild(artistCard);
        });
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Call fetchAndRenderData on page load
document.addEventListener("DOMContentLoaded", fetchAndRenderData);

// Listen for Supabase updates and re-fetch data
supabase
    .from("artworks")
    .on("INSERT", fetchAndRenderData)
    .on("UPDATE", fetchAndRenderData)
    .on("DELETE", fetchAndRenderData)
    .subscribe();

supabase
    .from("artists")
    .on("INSERT", fetchAndRenderData)
    .on("UPDATE", fetchAndRenderData)
    .on("DELETE", fetchAndRenderData)
    .subscribe();

//Mobile Nav Interactions

const hamburger = document.querySelector('.hamburger-wrap');
const navOverlay = document.querySelector('.nav-overlay');
const navItems = document.querySelectorAll('.m-nav-item-wrap');
const navLinks = document.querySelectorAll('.m-nav-item-wrap a');
const body = document.body;

hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active'); // Toggle X shape
    navOverlay.classList.toggle('active'); // Show/hide overlay
    body.style.overflow = isOpen ? "hidden" : "auto"; // Prevent scrolling when open

    if (isOpen) {
        // Open the nav with staggered width expansion and links sliding in
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.width = "100%"; // Animate width to 100%
            }, index * 150); // Stagger width animation
        });

        setTimeout(() => {
            navLinks.forEach((link, index) => {
                setTimeout(() => {
                    link.style.transform = "translateY(0)";
                    link.style.opacity = "1";
                }, index * 150); // Stagger link slide-in animation
            });
        }, navItems.length * 150); // Start link animations after width is done
    } else {
        // Close the nav with staggered width shrinking and links sliding out
        navLinks.forEach((link, index) => {
            setTimeout(() => {
                link.style.transform = "translateY(20px)";
                link.style.opacity = "0";
            }, index * 150); // Reverse link slide-out effect with delay
        });

        setTimeout(() => {
            // Reverse width (shrink back to 0%)
            navItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.width = "0%"; // Shrink width to 0%
                }, index * 150); // Reverse width animation order
            });
        }, navLinks.length * 150); // Start width reverse after links have slid out
    }
});

// Close the nav when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Prevent the default link click behavior for a short time
        e.preventDefault();

        // Reverse the nav opening animations before redirecting
        navLinks.forEach((link, index) => {
            setTimeout(() => {
                link.style.transform = "translateY(20px)";
                link.style.opacity = "0";
            }, index * 150); // Reverse link slide-out effect with delay
        });

        setTimeout(() => {
            navItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.width = "0%"; // Shrink width to 0%
                }, index * 150); // Reverse width animation order
            });
        }, navLinks.length * 150); // Start width reverse after links have slid out

        // Wait for the animation to complete, then navigate
        setTimeout(() => {
            window.location.href = link.href; // Navigate to the link after animations
        }, navLinks.length * 150 + 500); // Wait for animations to complete before navigating
    });
});

