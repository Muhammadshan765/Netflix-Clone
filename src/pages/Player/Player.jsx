import React, { useEffect, useMemo, useState } from 'react'
import './Player.css'
import back_arrow_icon from '../../assets/back_arrow_icon.png'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useWatchLater } from '../../context/WatchLaterContext'

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNmU4NmY4YWU3Yjc5YjM5YWU3YTFiMzk3MTM3NGU0OCIsIm5iZiI6MTc2MTcyODAwNC43NTEwMDAyLCJzdWIiOiI2OTAxZDYwNGMxMjk3ODgyYTZmODkxZDIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.LftYtipdGiu-C4apowAQJXGJ2iHnWNyWARZiE'
  }
};

const Player = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toggleWatchLater, isSaved } = useWatchLater()

  const [videoKey, setVideoKey] = useState('')
  const [movieDetails, setMovieDetails] = useState(null)
  const [cast, setCast] = useState([])
  const [similarTitles, setSimilarTitles] = useState([])
  const [status, setStatus] = useState({ loading: true, error: null })

  useEffect(() => {
    if (!id) return

    const fetchMovieData = async () => {
      try {
        setStatus({ loading: true, error: null })

        const [videoRes, detailRes, creditsRes, similarRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, API_OPTIONS),
          fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, API_OPTIONS),
          fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, API_OPTIONS),
          fetch(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`, API_OPTIONS)
        ])

        if (!detailRes.ok) throw new Error('Failed to load movie details')

        const [videoJson, detailJson, creditsJson, similarJson] = await Promise.all([
          videoRes.json(),
          detailRes.json(),
          creditsRes.json(),
          similarRes.json()
        ])

        const preferredVideo = videoJson.results?.find(item => item.type === 'Trailer') || videoJson.results?.[0] || null
        setVideoKey(preferredVideo?.key || '')
        setMovieDetails(detailJson)
        setCast((creditsJson.cast || []).slice(0, 6))
        setSimilarTitles((similarJson.results || []).slice(0, 6))
        setStatus({ loading: false, error: null })
      } catch (error) {
        console.error(error)
        setStatus({ loading: false, error: 'Unable to load movie info right now.' })
      }
    }

    fetchMovieData()
  }, [id])

  const formattedGenres = useMemo(
    () => movieDetails?.genres?.map(genre => genre.name) || [],
    [movieDetails]
  )

  const watchLaterPayload = useMemo(() => {
    if (!movieDetails) return null

    return {
      id: movieDetails.id,
      title: movieDetails.title,
      poster_path: movieDetails.poster_path,
      backdrop_path: movieDetails.backdrop_path,
      release_date: movieDetails.release_date,
      vote_average: movieDetails.vote_average
    }
  }, [movieDetails])

  const isInWatchLater = movieDetails ? isSaved(movieDetails.id) : false

  const handleWatchLater = () => {
    if (!watchLaterPayload) return
    toggleWatchLater(watchLaterPayload)
  }

  if (status.loading) {
    return (
      <div className='player player--center'>
        <p>Loading movie info…</p>
      </div>
    )
  }

  if (status.error || !movieDetails) {
    return (
      <div className='player player--center'>
        <p>{status.error || 'Movie not found.'}</p>
        <button className='player-btn' onClick={() => navigate(-1)}>Go Back</button>
      </div>
    )
  }

  const releaseYear = movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : '—'
  const runtime = movieDetails.runtime ? `${movieDetails.runtime} min` : null
  const rating = movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : null

  return (
    <div className='player'>
      <button className='player-back-btn' onClick={() => navigate(-1)} aria-label='Back to previous page'>
        <img src={back_arrow_icon} alt='Back' />
      </button>

      <section className='player-hero'>
        <div className='player-video'>
          {videoKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoKey}`}
              title='Trailer'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            ></iframe>
          ) : (
            <div className='player-video__fallback'>
              <p>Trailer not available</p>
            </div>
          )}
        </div>

        <div className='player-meta'>
          <h1>{movieDetails.title}</h1>
          <p className='player-tagline'>{movieDetails.tagline}</p>
          <div className='player-pill-group'>
            {releaseYear !== '—' && <span>{releaseYear}</span>}
            {runtime && <span>{runtime}</span>}
            {rating && <span>⭐ {rating}</span>}
            {formattedGenres.slice(0, 3).map(genre => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
          <div className='player-actions'>
            <button
              className={`player-watchlater-btn ${isInWatchLater ? 'player-watchlater-btn--saved' : ''}`}
              onClick={handleWatchLater}
            >
              {isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
            </button>
          </div>
        </div>
      </section>

      <section className='player-section'>
        <h2>Overview</h2>
        <p>{movieDetails.overview || 'No overview available for this title yet.'}</p>
        <div className='player-facts'>
          <div>
            <p className='player-facts__label'>Status</p>
            <p>{movieDetails.status || '—'}</p>
          </div>
          <div>
            <p className='player-facts__label'>Language</p>
            <p>{movieDetails.original_language?.toUpperCase() || '—'}</p>
          </div>
          <div>
            <p className='player-facts__label'>Budget</p>
            <p>{movieDetails.budget ? `$${movieDetails.budget.toLocaleString()}` : '—'}</p>
          </div>
          <div>
            <p className='player-facts__label'>Revenue</p>
            <p>{movieDetails.revenue ? `$${movieDetails.revenue.toLocaleString()}` : '—'}</p>
          </div>
        </div>
      </section>

      <section className='player-section'>
        <h2>Cast</h2>
        <div className='player-cast-grid'>
          {cast.length === 0 && <p>No cast information available.</p>}
          {cast.map(member => (
            <div className='cast-card' key={member.credit_id}>
              <img
                src={
                  member.profile_path
                    ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                    : 'https://via.placeholder.com/185x278?text=No+Image'
                }
                alt={member.name}
              />
              <p className='cast-card__name'>{member.name}</p>
              <p className='cast-card__role'>{member.character}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='player-section'>
        <div className='player-section__header'>
          <h2>More Like This</h2>
          {!similarTitles.length && <p>Coming soon.</p>}
        </div>

        <div className='player-similar-grid'>
          {similarTitles.map(title => (
            <Link to={`/player/${title.id}`} className='similar-card' key={title.id}>
              <img
                src={
                  title.poster_path
                    ? `https://image.tmdb.org/t/p/w300${title.poster_path}`
                    : 'https://via.placeholder.com/300x450?text=No+Image'
                }
                alt={title.title}
              />
              <div>
                <p className='similar-card__title'>{title.title}</p>
                <p className='similar-card__meta'>
                  {title.release_date?.slice(0, 4) || '—'} · ⭐ {title.vote_average?.toFixed(1) ?? '—'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Player
