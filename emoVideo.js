const moodToQueryMap = {
    anger: 'Mayonaise (2011 Remaster)',
    disgust: 'calm down selena gomez 30 seconds',
    fear: 'In The Dark swae lee Status Video',
    joy: 'Sunroof whatsapp status music vibes',
    sadness: 'STAY - New English Song Whatsapp Status Lyrics Video',
    surprise: 'Maroon 5 Sugar whatsapp status',
  };
  
  const apiKey = "<ADD_KEY_HERE>";
  const content = document.getElementById('content');
  const currentEmotion = document.getElementById('currentEmotion');
  let isApiCallPending = false;
  
  async function playVideo(mood) {
    currentEmotion.innerHTML = mood;
    
    if (!isApiCallPending) {
      isApiCallPending = true;
      
      try {
        const videoId = await makeApiCall(moodToQueryMap[mood]);
        content.innerHTML = `
          <iframe id="video" width="420" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=1"></iframe>
        `;
      } catch (error) {
        console.log(error);
      }
      
      isApiCallPending = false;
    }
  }
  
  async function makeApiCall(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&q=${query}&key=${apiKey}`;
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
  
    const data = await response.json();
  
    if (!data.items || data.items.length === 0) {
      throw new Error('No video found');
    }
  
    return data.items[0].id.videoId;
  }
  