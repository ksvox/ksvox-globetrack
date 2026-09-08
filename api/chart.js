// Spotify API Client Credentials and Token Cache
let cachedToken = null;
let tokenExpirationTime = 0;

// Spotify API未設定または取得失敗時に使用するフォールバックデータ
const DEMO_DATABASE = {
    'US': [
        { title: 'Birds of a Feather', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT' },
        { title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', album: 'Where I\'ve Been' },
        { title: 'Not Like Us', artist: 'Kendrick Lamar', album: 'Not Like Us' },
        { title: 'Espresso', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet' },
        { title: 'I Had Some Help', artist: 'Post Malone ft. Morgan Wallen', album: 'F-1 Trillion' },
        { title: 'Please Please Please', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet' },
        { title: 'Good Luck, Babe!', artist: 'Chappell Roan', album: 'Good Luck, Babe!' },
        { title: 'Million Dollar Baby', artist: 'Tommy Richman', album: 'Million Dollar Baby' },
        { title: 'Too Sweet', artist: 'Hozier', album: 'Unheard' },
        { title: 'Lose Control', artist: 'Teddy Swims', album: 'I\'ve Tried Everything' }
    ],
    'GB': [
        { title: 'Espresso', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet' },
        { title: 'Please Please Please', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet' },
        { title: 'Birds of a Feather', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT' },
        { title: 'Good Luck, Babe!', artist: 'Chappell Roan', album: 'Good Luck, Babe!' },
        { title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', album: 'Where I\'ve Been' },
        { title: 'Too Sweet', artist: 'Hozier', album: 'Unheard' },
        { title: 'Taste', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet' },
        { title: 'Stick Season', artist: 'Noah Kahan', album: 'Stick Season' },
        { title: 'Beautiful Things', artist: 'Benson Boone', album: 'Fireworks & Rollerblades' },
        { title: 'Greedy', artist: 'Tate McRae', album: 'THINK LATER' }
    ],
    'JP': [
        { title: 'ライラック', artist: 'Mrs. GREEN APPLE', album: 'ライラック' },
        { title: 'Bling-Bang-Bang-Born', artist: 'Creepy Nuts', album: 'Bling-Bang-Bang-Born' },
        { title: '晩餐歌', artist: 'tuki.', album: '晩餐歌' },
        { title: '幾億光年', artist: 'Omoinotake', album: '幾億光年' },
        { title: '怪獣の花唄', artist: 'Vaundy', album: 'strobo' },
        { title: 'アイドル', artist: 'YOASOBI', album: 'THE BOOK 3' },
        { title: '唱', artist: 'Ado', album: '唱' },
        { title: 'SPECIALZ', artist: 'King Gnu', album: 'THE GREATEST UNKNOWN' },
        { title: '青と夏', artist: 'Mrs. GREEN APPLE', album: '青と夏' },
        { title: 'Subtitle', artist: 'Official髭男dism', album: 'Subtitle' }
    ]
};

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("Vercel Environment Variables SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set.");
        return null;
    }

    // キャッシュされたトークンが有効期限内であれば再利用
    if (cachedToken && Date.now() < tokenExpirationTime) {
        return cachedToken;
    }

    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            console.error('Failed to get Spotify token:', response.statusText);
            return null;
        }

        const data = await response.json();
        cachedToken = data.access_token;
        // トークンの有効期限（秒）より少し手前で更新するように設定
        tokenExpirationTime = Date.now() + (data.expires_in - 60) * 1000;
        return cachedToken;
    } catch (err) {
        console.error('Error in getSpotifyToken:', err);
        return null;
    }
}

function getDemoTracks(countryCode, limit = 10) {
    const baseTracks = DEMO_DATABASE[countryCode] || DEMO_DATABASE['US'] || [];
    const result = [];
    
    for (let i = 0; i < limit; i++) {
        if (i < baseTracks.length) {
            const t = baseTracks[i];
            result.push({
                rank: i + 1,
                title: t.title,
                artist: t.artist,
                album: t.album,
                img: `https://placehold.co/100x100/1db954/000000?text=${encodeURIComponent(t.title.substring(0, 5))}`,
                previewUrl: null,
                url: 'https://open.spotify.com'
            });
        } else {
            const trackNum = i + 1;
            result.push({
                rank: trackNum,
                title: `Top Hit Song #${trackNum}`,
                artist: `Featured Artist ${trackNum}`,
                album: `Chart Hits Album Vol.${Math.ceil(trackNum / 5)}`,
                img: `https://placehold.co/100x100/282828/1db954?text=%23${trackNum}`,
                previewUrl: null,
                url: 'https://open.spotify.com'
            });
        }
    }
    return result;
}

export default async function handler(req, res) {
    // CORSヘッダー設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    const { playlistId, country = 'US', limit = 10 } = req.query;
    const limitNum = parseInt(limit, 10) || 10;

    // Spotify トークン取得
    const token = await getSpotifyToken();

    // トークンが無い・設定が無い場合はデモデータを返却
    if (!token || !playlistId) {
        const demoData = getDemoTracks(country, limitNum);
        return res.status(200).json({ source: 'demo', tracks: demoData });
    }

    try {
        const market = country === 'GLOBAL' ? 'US' : country;
        const spotifyRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limitNum}&market=${market}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!spotifyRes.ok) {
            console.warn(`Spotify API response status ${spotifyRes.status}, returning fallback demo data.`);
            const demoData = getDemoTracks(country, limitNum);
            return res.status(200).json({ source: 'demo-fallback', tracks: demoData });
        }

        const data = await spotifyRes.json();
        if (!data.items || data.items.length === 0) {
            const demoData = getDemoTracks(country, limitNum);
            return res.status(200).json({ source: 'demo-empty', tracks: demoData });
        }

        const tracks = data.items.slice(0, limitNum).map((item, index) => {
            const track = item.track || item;
            return {
                rank: index + 1,
                title: track.name || 'Unknown Track',
                artist: track.artists ? track.artists.map(a => a.name).join(', ') : 'Unknown Artist',
                album: track.album ? track.album.name : '',
                img: track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : 'https://placehold.co/100x100/282828/ffffff?text=Music',
                previewUrl: track.preview_url || null,
                url: track.external_urls ? track.external_urls.spotify : '#'
            };
        });

        return res.status(200).json({ source: 'spotify', tracks: tracks });
    } catch (error) {
        console.error('Error fetching tracks from Spotify:', error);
        const demoData = getDemoTracks(country, limitNum);
        return res.status(200).json({ source: 'demo-error', tracks: demoData });
    }
}
