import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './components/Landing';
import { Player } from './components/Player';
import { Library } from './components/Library';
import { Playlists } from './components/Playlists';
import { Login } from './components/Login';
import { Upload } from './components/Upload';
import { Settings } from './components/Settings';
import { WatchLater } from './components/WatchLater';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { WatchLaterProvider } from './contexts/WatchLaterContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { APP_ROUTES } from './constants';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>This feature is coming soon.</p>
  </div>
);

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <WatchLaterProvider>
          <BookmarkProvider>
            <PlayerProvider>
              <PlaylistProvider>
                <HashRouter>
                  <Layout>
                    <Routes>
                      <Route path={APP_ROUTES.HOME} element={<Landing />} />
                      <Route path={APP_ROUTES.LOGIN} element={<Login />} />
                      <Route path={APP_ROUTES.PLAYER} element={<Player />} />
                      <Route path={APP_ROUTES.LIBRARY} element={<Library />} />
                      <Route path={APP_ROUTES.PLAYLISTS} element={<Playlists />} />
                      <Route path={APP_ROUTES.WATCH_LATER} element={<WatchLater />} />
                      <Route path={APP_ROUTES.UPLOAD} element={<Upload />} />
                      <Route path={APP_ROUTES.SETTINGS} element={<Settings />} />
                      <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
                    </Routes>
                  </Layout>
                </HashRouter>
              </PlaylistProvider>
            </PlayerProvider>
          </BookmarkProvider>
        </WatchLaterProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;