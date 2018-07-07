const API_KEY = `AIzaSyAowmVgFQkCDODU9HZ9SFVmeQlniBW_zfU`;

function searchYoutube(query, page) {
    let ytSearch = 'https://www.googleapis.com/youtube/v3/search?';
    let pageToken = page || '';
    let q = query || 'cat';
    let params = {
        q,
        pageToken,
        part: 'snippet', //add more as a single string space seperated
        order: 'viewCount',
        type: 'video',
        videoDefinition: 'high',
        videoEmbeddable: 'true',
        videoCategoryId: 10,
        key: API_KEY,
        _t: Date.now()
    }
    let url = ytSearch + $.param(params);
    let options = {
        url,
        method: 'GET',
        headers: { 'Access-Control-Allow-Origin': '*' }
    }
    return $.ajax(options).then(res => displayResults(res))
        .catch(err => console.log(err));
};
