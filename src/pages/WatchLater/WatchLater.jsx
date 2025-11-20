import React from 'react'
import './WatchLater.css'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { useWatchLater } from '../../context/WatchLaterContext'
import { Link } from 'react-router-dom'

const WatchLater = () => {
  const { watchLater, removeFromWatchLater } = useWatchLater()

  return (
    <div className='watch-later'>
      <Navbar />
      <div className='watch-later-content'>
        <h1>My List</h1>
        {watchLater.length === 0 ? (
          <div className='watch-later-empty'>
            <p>Your watch later queue is empty.</p>
            <Link to='/' className='watch-later-link'>Browse titles</Link>
          </div>
        ) : (
          <div className='watch-later-grid'>
            {watchLater.map(movie => (
              <div className='watch-later-card' key={movie.id}>
                <Link to={`/player/${movie.id}`} className='watch-later-card__poster'>
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : 'https://via.placeholder.com/300x450?text=No+Image'
                    }
                    alt={movie.title}
                  />
                </Link>
                <div className='watch-later-card__meta'>
                  <div>
                    <h3>{movie.title}</h3>
                    <p>
                      {movie.release_date ? movie.release_date.slice(0, 4) : '—'} · ⭐{' '}
                      {movie.vote_average ? movie.vote_average.toFixed(1) : '—'}
                    </p>
                  </div>
                  <button onClick={() => removeFromWatchLater(movie.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default WatchLater


