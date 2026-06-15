import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabase = createClient(
  'https://eskrabhfpxnpoqnpieou.supabase.co',
  'YOUR_PUBLISHABLE_KEY'
);

const form = document.querySelector('#waitlist-form');
const releasedRadios = document.querySelectorAll('input[name="released"]');
const spotifySection = document.querySelector('#spotify-section');
const songSection = document.querySelector('#song-section');
const spotifyInput = document.querySelector('#spotify-profile');
const songInput = document.querySelector('#song-file');

const spotifyArtistUrlPattern =
  /^https:\/\/open\.spotify\.com\/artist\/[A-Za-z0-9]+(?:[/?#].*)?$/;

function setSectionState(section, isVisible) {
  section.style.display = isVisible ? 'block' : 'none';
}

function updateConditionalFields() {
  const releasedMusic = form.elements.released.value;

  const isReleased = releasedMusic === 'yes';
  const isUnreleased = releasedMusic === 'no';

  setSectionState(spotifySection, isReleased);
  setSectionState(songSection, isUnreleased);

  spotifyInput.required = isReleased;
  songInput.required = isUnreleased;

  if (!isReleased) {
    spotifyInput.value = '';
  }
}

function validateSpotifyProfile() {
  if (!spotifyInput.required) return true;

  if (spotifyArtistUrlPattern.test(spotifyInput.value.trim())) {
    spotifyInput.setCustomValidity('');
    return true;
  }

  spotifyInput.setCustomValidity(
    'Please enter a valid Spotify Artist URL'
  );

  form.reportValidity();
  return false;
}

releasedRadios.forEach((radio) => {
  radio.addEventListener('change', updateConditionalFields);
});

updateConditionalFields();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;
  if (!validateSpotifyProfile()) return;

  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  try {
    let songUrl = '';

    if (
      form.elements.released.value === 'no' &&
      songInput.files.length > 0
    ) {
      const file = songInput.files[0];

      const fileName =
        Date.now() +
        '-' +
        file.name.replace(/\s+/g, '_');

      const { error: uploadError } = await supabase
        .storage
        .from('audio-uploads')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase
        .storage
        .from('audio-uploads')
        .getPublicUrl(fileName);

      songUrl = data.publicUrl;
    }

    const payload = {
      full_name: form.elements.fullName.value.trim(),
      artist_name: form.elements.artistName.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      social_accounts: form.elements.socials.value.trim(),
      youtube_channel: form.elements.youtube.value.trim(),
      released_music:
        form.elements.released.value === 'yes',
      spotify_profile:
        form.elements.released.value === 'yes'
          ? spotifyInput.value.trim()
          : '',
      song_file_url: songUrl
    };

    const { error } = await supabase
      .from('waitlist')
      .insert([payload]);

    if (error) {
      throw error;
    }

    window.location.href = 'thanks.html';

  } catch (error) {
    console.error(error);

    alert(
      error.message ||
      'Submission failed. Please try again.'
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent =
      'Submit to waitlist';
  }
});
