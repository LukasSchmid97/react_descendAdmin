import React from 'react';
import logo from './logo.svg';
import './App.css';

import PlayerCard from './components/PlayerCard'


class App extends React.Component {
  constructor(){
    super()
    this.state = {
      clanidlist: [],
      playersLastPlayed: [],
      playersLastPlayedWithClanmates: {},
      loading: true
    }
    this.getLatestActivity = this.getLatestActivity.bind(this)
  }

  getHeader(){
    return {'X-API-Key': 'f17e9079050f49cf8bd50a6893293fcd'}
  }

  getClanInteractions(player){
    const charPromises = Promise.all(
      player.characterIds.map(
        characterId => {
          let activityURL = `https://stats.bungie.net/Platform/Destiny2/${player.membershipType}/Account/${player.destinyMembershipId}/Character/${player.characterId}/Stats/Activities/?count=10&mode=4&page=0`
          return fetch(activityURL, { 
            method: 'get', 
            headers: new Headers(this.getHeader())
          })
        }
      )
    )
    
    charPromises
      .then(results => 
        results.slice(0,1).map(
          r => r.json().then(
            jsonData => {
              let activityList = jsonData['Response']['activities']
              const historyPromise = Promise.all(
                activityList.map(activity => {
                  let instanceId = activity['activityDetails']['instanceId']
                  let pgcrURL = `https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${instanceId}/`
                  return fetch(pgcrURL, { 
                    method: 'get', 
                    headers: new Headers(this.getHeader())
                  })
                })
              )
              
              historyPromise
                .then(results => 
                  results.slice(0,1).map(
                    r => r.json().then(jsonData => {
                      console.log(jsonData['Response']['entries'])
                    })
                  )
                )

            }
          )
        )
      )
  }

  getLatestActivity(destinyProfileData){
    let destinyProfile = destinyProfileData['data']

    //console.log(destinyProfile)

    let destinyMembershipId = destinyProfile['userInfo']['membershipId']
    let membershipType = destinyProfile['userInfo']['membershipType']
    let userName = destinyProfile['userInfo']['displayName']
    let characterIds = destinyProfile['characterIds']
    let dateLastPlayed = destinyProfile['dateLastPlayed'] //"2020-10-25T21:00:37Z"

    let playerObject = {
      destinyMembershipId: destinyMembershipId,
      membershipType: membershipType,
      userName: userName,
      characterIds: characterIds,
      dateLastPlayed: Date.parse(dateLastPlayed)
    }

    this.setState(prevState => {
      return {
        playersLastPlayed: [...prevState.playersLastPlayed, playerObject],
        loading: false
      }
    })
  }

  getAllMembersCharacters(memberlist){
    let members = memberlist.map(member => {
      return {
        id: member['destinyUserInfo']['membershipId'],
        type: member['destinyUserInfo']['membershipType'],
        name: member['destinyUserInfo']['LastSeenDisplayName']
      }
    });

    const charPromises = Promise.all(
      members.map(
        member => {
          let charURL = `https://stats.bungie.net/Platform/Destiny2/${member.type}/Profile/${member.id}/?components=100,200`
          return fetch(charURL, { 
            method: 'get', 
            headers: new Headers(this.getHeader())
          })
        }
      )
    );

    charPromises
      .then(results => 
        results.map(
          r => r.json().then(
            jsonData => {
              this.getLatestActivity(jsonData['Response']['profile'])
            }
          )
          )
      )
  }

  componentDidMount(){
    let clanMembersURL = "https://www.bungie.net/Platform/GroupV2/4107840/members/"
    fetch(clanMembersURL, { 
      method: 'get', 
      headers: new Headers(this.getHeader())
    })
      .then(data => {
        data.json().then(jsonData => {
          let memberlist = jsonData['Response']['results']
          this.setState({
            clanidlist: memberlist.map(member => {
              return member['destinyUserInfo']['membershipId']
            })
          })
          this.getAllMembersCharacters(memberlist)
        })
      })
  }

  render(){

    let playerarray = this.state.playersLastPlayed
    playerarray.sort(function(a, b) {
      var keyA = a.dateLastPlayed,
        keyB = b.dateLastPlayed;
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    })
    
    const cardlist = playerarray.map(player => <PlayerCard key={player.destinyMembershipId} player={player}/>)


    return (
      <div className="App">
        <header className="App-header">
          Descend Admin Tool
        </header>
        {this.state.loading && <img src={logo} className="App-logo" alt="logo" />}
        <main className="main-area">
          <div className="centered">
              <section className="cards">
                {cardlist}
              </section>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
