// import React from "react";
// import { useCurrentUser, useRecentlyViewed } from "../Context/Context";
// import HeroImage from "../components/Images/Image";
// import { useState } from "react";
// import { NavLink } from "react-router-dom";
// import { Genre } from "./Movie";
import Visualise_random_walks from "../components/canvas"
export default function Home() {
  return (
    <main>
      <DisplayHome></DisplayHome>
    </main>
  )
}

function DisplayHome() {

  return (<main className="centered_container">
    <h1>Bon's Simulation </h1>
    <h3 className="home">Random Walks and Cellula Automata!</h3>
    <div>
      <Visualise_random_walks></Visualise_random_walks>
    </div>
  </main>
  )
}
function Features(props) {
  // Index to show list of recently seen movies
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const incrementImage = () => {
    // wrap around
    if (activeImageIndex >= props.title.length - 1) setActiveImageIndex(0);
    else setActiveImageIndex(activeImageIndex + 1);
  }

  const decrementImage = () => {
    // wrap around
    if (activeImageIndex === 0) setActiveImageIndex(props.title.length - 1);
    else setActiveImageIndex(activeImageIndex - 1);
  }
  return (
    <div>
      <div id="hero" className="card">
        <h2>You've Recently Viewed</h2>
        <div className="card-body">
          <h3 className="card-title" >{props.title[activeImageIndex]}</h3>
          <div className="genre_container">
            {props.genres[activeImageIndex].map((genre, index) => (<Genre key={index} title={genre} />))}
          </div>
          <NavLink to={`/movies/data?imdbID=${props.id[activeImageIndex]}`}> <img src={props.image[activeImageIndex]} height={400} alt={`Poster of ${props.title[activeImageIndex]}`} /></NavLink>
        </div>
        <div className="btn-group" role="group" aria-label="Next-Prev index">
          {props.title.length > 1 ? <button className="btn btn-primary" aria-label="Previous Show" onClick={decrementImage}>Prev</button> : null}
          {props.title.length > 1 ? <button className="btn btn-primary" aria-label="Next Show" onClick={incrementImage}>Next</button> : null}
        </div>
      </div>
    </div>
  )
}