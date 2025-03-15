import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxbfiwftjwfpsrdjxwfq.supabase.co';
const supabaseKey = 'your-public-api-key'; // Replace with your actual public API key
const supabase = createClient(supabaseUrl, supabaseKey);

document.querySelectorAll('.drop-zone__input').forEach(inputElement => {
    const dropZoneElement = inputElement.closest('.drop-zone');

    dropZoneElement.addEventListener('click', () => {
        openModal(inputElement);
    });

    inputElement.addEventListener('change', () => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneElement.classList.add('drop-zone--over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropZoneElement.addEventListener(type, () => {
            dropZoneElement.classList.remove('drop-zone--over');
        });
    });

    dropZoneElement.addEventListener('drop', (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove('drop-zone--over');
    });
});

function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');

    // First time - remove the prompt
    if (dropZoneElement.querySelector('.drop-zone__prompt')) {
        dropZoneElement.querySelector('.drop-zone__prompt').remove();
    }

    // First time - there is no thumbnail element, so let's create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement('div');
        thumbnailElement.classList.add('drop-zone__thumb');
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    // Show thumbnail for image files
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.innerHTML = `<img src="${reader.result}" alt="${file.name}"><span>${file.name}</span>`;
        };
    } else {
        thumbnailElement.innerHTML = `<span>${file.name}</span>`;
    }

    thumbnailElement.addEventListener('click', () => {
        thumbnailElement.remove();
        dropZoneElement.querySelector('input').value = '';
        const prompt = document.createElement('span');
        prompt.classList.add('drop-zone__prompt');
        prompt.textContent = 'Drag & Drop your photo here or click to upload';
        dropZoneElement.appendChild(prompt);
    });
}

function openModal(inputElement) {
    const modal = document.getElementById('uploadModal');
    const closeBtn = modal.querySelector('.close');
    const modalDropZone = modal.querySelector('.drop-zone');
    const modalInput = modal.querySelector('#modal-file-input');

    modal.style.display = 'block';

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    modalDropZone.addEventListener('click', () => {
        modalInput.click();
    });

    modalInput.addEventListener('change', () => {
        if (modalInput.files.length) {
            inputElement.files = modalInput.files;
            updateThumbnail(inputElement.closest('.drop-zone'), modalInput.files[0]);
            modal.style.display = 'none';
        }
    });

    modalDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        modalDropZone.classList.add('drop-zone--over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        modalDropZone.addEventListener(type, () => {
            modalDropZone.classList.remove('drop-zone--over');
        });
    });

    modalDropZone.addEventListener('drop', (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
            modalInput.files = e.dataTransfer.files;
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(inputElement.closest('.drop-zone'), e.dataTransfer.files[0]);
            modal.style.display = 'none';
        }

        modalDropZone.classList.remove('drop-zone--over');
    });
}

// Handle form submission
document.getElementById('artwork-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const size = document.getElementById('size').value;
    const price = document.getElementById('price').value;
    const portfolio = document.getElementById('portfolio').value;
    const socialLink = document.getElementById('social-link').value;

    console.log('Form data:', { name, email, message, title, description, size, price, portfolio, socialLink });

    // Upload photo
    const photoFile = document.getElementById('photo').files[0];
    let photoUrl = '';
    if (photoFile) {
        const { data: photoData, error: photoError } = await supabase.storage
            .from('photos')
            .upload(`public/${photoFile.name}`, photoFile);

        if (photoError) {
            console.error('Error uploading photo:', photoError);
        } else {
            photoUrl = photoData.Key;
        }
    }

    // Upload artwork
    const artworkFile = document.getElementById('artwork').files[0];
    let artworkUrl = '';
    if (artworkFile) {
        const { data: artworkData, error: artworkError } = await supabase.storage
            .from('artworks')
            .upload(`public/${artworkFile.name}`, artworkFile);

        if (artworkError) {
            console.error('Error uploading artwork:', artworkError);
        } else {
            artworkUrl = artworkData.Key;
        }
    }

    const { data, error } = await supabase
        .from('Broccoli Street Art')
        .insert([
            {
                column_name: name,
                column_email: email,
                column_about: message,
                colmn_avatar: photoUrl,
                artwork_title: title,
                artwork_details: description,
                artworkimg_url: artworkUrl,
                art_size: size,
                art_price: price,
                portfolio_url: portfolio,
                social_url: socialLink
            }
        ]);

    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log('Data inserted successfully:', data);
    }
});