import React from 'react'

function PlayerCard(props){
    console.log(props)
    return (
        <article className="card">
            <a href=".">
                <h1>{props.player.userName}</h1>
                <div className="card-content">
                    <label>Last online:</label> <br/>
                    <label>{Math.floor((Date.now() - props.player.dateLastPlayed)/(1000*60*60*24))} days ago</label>
                </div>
            </a>
        </article>
    )
}


export default PlayerCard