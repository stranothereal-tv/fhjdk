const FORMSPREE_ENDPOINT = 'https://formspree.io/f/maqzvavq';
const SUPABASE_REST_URL = 'https://eskrabhfpxnpoqnpieou.supabase.co/rest/v1';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_c7y_c6oeVpFK53zlvQCaLQ_m-RUVw1a';
const SUPABASE_WAITLIST_TABLE = 'waitlist_submissions';

const form = document.querySelector('#waitlist-form');
const releasedRadios = document.querySelectorAll('input[name="released"]');
const spotifySection = document.querySelector('#spotify-section');
const songSection = document.querySelector('#song-section');
const spotifyInput = document.querySelector('#spotify-profile');
const songInput = document.querySelector('#song-file');
const submissionDateInput = document.querySelector('#submission-date');
const formStatus = document.querySelector('#form-status');
const submitButton = form.querySelector('button[type="submit"]');

const spotifyArtistUrlPattern = /^https:\/\/open\.spotify\.com\/artist\/[A-Za-z0-9]+(?:[/?#].*)?$/;

function setSectionState(section, isVisible) {
  section.classList.toggle('conditional-section--visible', isVisible);
  section.setAttribute('aria-hidden', String(!isVisible));
}

function updateSelectedRadioState() {
  releasedRadios.forEach((radio) => {
    radio.closest('.radio-card').classList.toggle('radio-card--selected', radio.checked);
  });
}

function updateConditionalFields() {
  const releasedMusic = form.elements.released.value;
  const isReleased = releasedMusic === 'yes';
  const isUnreleased = releasedMusic === 'no';

  updateSelectedRadioState();
  setSectionState(spotifySection, isReleased);
  setSectionState(songSection, isUnreleased);

  spotifyInput.required = isReleased;
  spotifyInput.disabled = !isReleased;
  songInput.required = isUnreleased;
  songInput.disabled = !isUnreleased;

  if (!isReleased) {
    spotifyInput.value = '';
    spotifyInput.setCustomValidity('');
  }

  if (!isUnreleased) {
    songInput.value = '';
    songInput.setCustomValidity('');
  }
}

function validateSpotifyProfile() {
  if (!spotifyInput.required || spotifyArtistUrlPattern.test(spotifyInput.value.trim())) {
    spotifyInput.setCustomValidity('');
    return true;
  }

  spotifyInput.setCustomValidity('Please enter a valid Spotify Artist Profile URL.');
  return false;
}

function buildSubmission(submissionDate) {
  const formData = new FormData(form);
  const songFile = songInput.files[0];

  return {
    fullName: formData.get('fullName'),
    artistName: formData.get('artistName'),
    email: formData.get('email'),
    phoneNumber: formData.get('phone'),
    socialAccounts: formData.get('socials'),
    youtubeChannel: formData.get('youtube'),
    releasedMusic: formData.get('released'),
    spotifyArtistProfile: formData.get('released') === 'yes' ? formData.get('spotifyArtistProfile') : '',
    songFileName: formData.get('released') === 'no' && songFile ? songFile.name : '',
    submissionDate,
  };
}

function saveLocalSubmission(submission) {
  const submissions = JSON.parse(localStorage.getItem('solvaroWaitlistSubmissions') || '[]');
  submissions.push(submission);
  localStorage.setItem('solvaroWaitlistSubmissions', JSON.stringify(submissions));
}

function buildSupabasePayload(submission) {
  return {
    full_name: submission.fullName,
    artist_name: submission.artistName,
    email: submission.email,
    phone_number: submission.phoneNumber,
    social_accounts: submission.socialAccounts,
    youtube_channel: submission.youtubeChannel,
    released_music: submission.releasedMusic,
    spotify_artist_profile: submission.spotifyArtistProfile,
    song_file_name: submission.songFileName,
    submission_date: submission.submissionDate,
  };
