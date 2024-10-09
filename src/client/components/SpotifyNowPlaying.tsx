import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface NowPlaying {
    albumImageUrl: string;
    artist: string;
    isPlaying: boolean;
    songUrl: string;
    title: string;
}

const SpotifyNowPlaying: React.FC = () => {
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Insert your Spotify API credentials here
    const client_id = '9b45f558af51463fa167e4f3761ee51f';
    const client_secret = 'b47d4fbea50846b5b104a1ae82a6dfe4';
    const refresh_token = 'YOUR_SPOTIFY_REFRESH_TOKEN';

    const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
    const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

    const getAccessToken = async (): Promise<string | null> => {
        const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

        try {
            const response = await fetch(TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${basic}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token,
                }),
            });

            const data = await response.json();
            return data.access_token;
        } catch (err) {
            console.error('Error fetching access token:', err);
            setError('Failed to fetch access token.');
            return null;
        }
    };

    const getNowPlaying = async (access_token: string): Promise<NowPlaying | null> => {
        try {
            const response = await fetch(NOW_PLAYING_ENDPOINT, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (response.status === 204 || response.status > 400) {
                return null;
            }

            const song = await response.json();
            const albumImageUrl = song.item.album.images[0].url;
            const artist = song.item.artists.map((_artist: any) => _artist.name).join(', ');
            const isPlaying = song.is_playing;
            const songUrl = song.item.external_urls.spotify;
            const title = song.item.name;

            return {
                albumImageUrl,
                artist,
                isPlaying,
                songUrl,
                title,
            };
        } catch (err) {
            console.error('Error fetching now playing:', err);
            setError('Failed to fetch currently playing song.');
            return null;
        }
    };

    const fetchNowPlaying = async () => {
        const access_token = await getAccessToken();
        if (access_token) {
            const song = await getNowPlaying(access_token);
            setNowPlaying(song);
            setLoading(false);
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNowPlaying();
        const interval = setInterval(() => {
            fetchNowPlaying();
        }, 30000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return null;
    }

    if (error || !nowPlaying || !nowPlaying.isPlaying) {
        return null;
    }

    return (
        <motion.div
            className="spotify-player"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 1 }}
        >
            <img src={nowPlaying.albumImageUrl} alt={`${nowPlaying.title} album art`} className="album-cover" />
            <div className="song-info">
                <a href={nowPlaying.songUrl} target="_blank" rel="noopener noreferrer" className="song-title">
                    {nowPlaying.title}
                </a>
                <p className="artist-name">{nowPlaying.artist}</p>
            </div>
        </motion.div>
    );
};

export default SpotifyNowPlaying;
