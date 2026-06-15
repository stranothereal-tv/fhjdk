const form = document.querySelector('#waitlist-form');
const releasedRadios = document.querySelectorAll('input[name="released"]');
const spotifySection = document.querySelector('#spotify-section');
const songSection = document.querySelector('#song-section');
const spotifyInput = document.querySelector('#spotify-profile');
const songInput = document.querySelector('#song-file');

const CLOUD_NAME = "dn9aiiknm";
const UPLOAD_PRESET = "solvaro_uploads";

const spotifyArtistUrlPattern =
  /^https:\/\/open\.spotify\.com\/artist\/[A-Za-z0-9]+(?:[/?#].*)?$/;

function setSectionState(section, isVisible) {
  section.style.display = isVisible ? "block" : "none";
}

function updateConditionalFields() {
  const releasedMusic = form.elements.released.value;

  const isReleased = releasedMusic === "yes";
  const isUnreleased = releasedMusic === "no";

  setSectionState(spotifySection, isReleased);
  setSectionState(songSection, isUnreleased);

  spotifyInput.required = isReleased;
  songInput.required = isUnreleased;

  if (!isReleased) spotifyInput.value = "";
}

function validateSpotifyProfile() {
  if (!spotifyInput.required) return true;

  if (spotifyArtistUrlPattern.test(spotifyInput.value.trim())) {
    spotifyInput.setCustomValidity("");
    return true;
  }

  spotifyInput.setCustomValidity(
    "Please enter a valid Spotify Artist URL"
  );

  return false;
}

async function uploadSongToCloudinary(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Upload failed");
  }

  return data.secure_url;
}

releasedRadios.forEach((radio) => {
  radio.addEventListener("change", updateConditionalFields);
});

updateConditionalFields();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;
  if (!validateSpotifyProfile()) return;

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    let songUrl = "";

    if (
      form.elements.released.value === "no" &&
      songInput.files.length > 0
    ) {
      songUrl = await uploadSongToCloudinary(songInput.files[0]);
    }

    const submission = {
      fullName: form.elements.fullName.value,
      artistName: form.elements.artistName.value,
      email: form.elements.email.value,
      phone: form.elements.phone.value,
      socials: form.elements.socials.value,
      youtube: form.elements.youtube.value,
      released: form.elements.released.value,
      spotifyArtistProfile:
        form.elements.released.value === "yes"
          ? spotifyInput.value
          : "",
      songUrl: songUrl,
      submittedAt: new Date().toISOString()
    };

    const existing =
      JSON.parse(
        localStorage.getItem("solvaroWaitlistSubmissions")
      ) || [];

    existing.push(submission);

    localStorage.setItem(
      "solvaroWaitlistSubmissions",
      JSON.stringify(existing)
    );

    window.location.href = "thanks.html";
  } catch (error) {
    console.error(error);
    alert(
      "Cloudinary upload failed. Check your Upload Preset settings."
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit to waitlist";
  }
});
