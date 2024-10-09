// src/components/SpotifyNowPlaying.tsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Buffer } from 'buffer';
import './styles.css';
import { generatePKCECodes } from './utils/pkce';
import queryString from 'query-string';

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

    // Spotify API credentials
    const client_id = '9b45f558af51463fa167e4f3761ee51f'; // Your Client ID
    // Do NOT include client_secret in frontend code

    // Determine Redirect URI based on environment
    const redirect_uri = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/' // Local development
        : 'https://harshalarakala.github.io/personalwebsite/'; // Production

    const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
    const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

    // Function to initiate the authorization process
    const authorizeSpotify = async () => {
        const { code_verifier, code_challenge } = await generatePKCECodes();

        // Store the code_verifier for later use
        localStorage.setItem('spotify_code_verifier', code_verifier);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: client_id,
            scope: 'user-read-currently-playing user-read-playback-state',
            redirect_uri: redirect_uri,
            code_challenge_method: 'S256',
            code_challenge: code_challenge,
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    // Function to exchange authorization code for tokens
    const exchangeCodeForToken = async (code: string) => {
        const code_verifier = localStorage.getItem('spotify_code_verifier');

        if (!code_verifier) {
            setError('Code verifier not found.');
            return;
        }

        try {
            const response = await fetch(TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: client_id,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: redirect_uri,
                    code_verifier: code_verifier,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error_description || 'Failed to obtain access token.');
                return;
            }

            // Store tokens securely (e.g., in memory or secure storage)
            localStorage.setItem('spotify_access_token', data.access_token);
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
            localStorage.setItem('spotify_expires_at', (Date.now() + data.expires_in * 1000).toString());

            // Remove the code_verifier from storage
            localStorage.removeItem('spotify_code_verifier');
        } catch (err) {
            console.error('Error exchanging code for token:', err);
            setError('Error exchanging code for token.');
        }
    };

    // Function to refresh the access token using the refresh token
    const refreshAccessToken = async () => {
        const refresh_token = localStorage.getItem('spotify_refresh_token');

        if (!refresh_token) {
            setError('Refresh token not found.');
            return;
        }

        try {
            const response = await fetch(TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: client_id,
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error_description || 'Failed to refresh access token.');
                return;
            }

            // Update tokens
            localStorage.setItem('spotify_access_token', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }
            localStorage.setItem('spotify_expires_at', (Date.now() + data.expires_in * 1000).toString());
        } catch (err) {
            console.error('Error refreshing access token:', err);
            setError('Error refreshing access token.');
        }
    };

    // Function to get the access token, refresh if expired
    const getAccessToken = async (): Promise<string | null> => {
        const access_token = localStorage.getItem('spotify_access_token');
        const expires_at = localStorage.getItem('spotify_expires_at');

        if (access_token && expires_at) {
            if (Date.now() < parseInt(expires_at)) {
                return access_token;
            } else {
                // Token expired, refresh it
                await refreshAccessToken();
                return localStorage.getItem('spotify_access_token');
            }
        }

        return null;
    };

    // Function to fetch the currently playing song
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
            setError('Error fetching currently playing song.');
            return null;
        }
    };

    // Function to fetch "Now Playing" data
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
        // Parse the authorization code from the URL if present
        const parsed = queryString.parse(window.location.search);
        const code = parsed.code as string | undefined;

        if (code) {
            exchangeCodeForToken(code);
            // Remove the code parameter from the URL to clean up
            window.history.replaceState({}, document.title, redirect_uri);
        }

        fetchNowPlaying();

        const interval = setInterval(() => {
            fetchNowPlaying();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return null; // Optionally, display a loader here
    }

    if (error || !nowPlaying || !nowPlaying.isPlaying) {
        return (
            <div>
                <button onClick={authorizeSpotify} className="authorize-button">
                    Authorize Spotify
                </button>
            </div>
        );
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
