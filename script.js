const form = document.querySelector('#waitlist-form');
const releasedRadios = document.querySelectorAll('input[name="released"]');
const spotifySection = document.querySelector('#spotify-section');
const songSection = document.querySelector('#song-section');
const spotifyInput = document.querySelector('#spotify-profile');
const songInput = document.querySelector('#song-file');

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwELUkayTphsvnsS7ePUvWQelIc5iPNFGYaXs_J9V5119qmiLX9RdCCb37yExNQrluc/exec";

function setSectionState(section, visible) {
  section.style.display = visible ? "block" : "none";
}

function updateConditionalFields() {
  const released = form.elements.released.value;

  if (released === "yes") {
    setSectionState(spotifySection, true);
    setSectionState(songSection, false);

    spotifyInput.required = true;
    songInput.required = false;
  } else if (released === "no") {
    setSectionState(spotifySection, false);
    setSectionState(songSection, true);

    spotifyInput.required = false;
    songInput.required = true;
  }
}

releasedRadios.forEach(radio => {
  radio.addEventListener("change", updateConditionalFields);
});

updateConditionalFields();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!form.reportValidity()) return;

  const data = {
    fullName: form.fullName.value,
    artistName: form.artistName.value,
    email: form.email.value,
    phoneNumber: form.phone.value,
    socialAccounts: form.socials.value,
    youtubeChannel: form.youtube.value,
    releasedMusic: form.released.value,
    spotifyArtistProfile:
      form.released.value === "yes"
        ? spotifyInput.value
        : "",
    songFileUrl: "",
    submissionDate: new Date().toISOString()
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.text();

    console.log(result);

    alert("Application submitted successfully!");

    window.location.href = "Thanks.html";

  } catch (error) {
    console.error(error);
    alert("Error sending application.");
  }
});
