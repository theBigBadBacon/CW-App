import React from 'react'
import { Audio } from 'expo-av'
import { Button, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import './assets/style.css'

// Global stuff
let wordPauseMs     = 500 // Morse code 1 time unit (period)
let currentIndex    = 0
let soundClips      = {}
let sentances = [
  "Do you read me over?",
  "Allmänt anrop",
  "Hur är vädret där uppe?",
]

interface AppState {
  gridLetters: string[],
  currentSentance: string,
  currentClickIndex: number,
  points: number,
  gameOver: boolean
}

export default class App extends React.Component<{}, AppState> {

  constructor(props){
    super(props)
    this.state={
      gridLetters:["D", "e", "m", "o"],
      currentSentance:"Demo",
      currentClickIndex: 0,
      points: 0,
      gameOver: false
    }
  }

  async componentDidMount() {

    let lettersNumbers = ['Å','Ä','Ö','+','=','|']

    for (let i = 0; i < 9; i++) {
        lettersNumbers.push(i.toString())
    }
    for (let i = 0; i < 26; i++) {
        lettersNumbers.push((i+10).toString(36).toUpperCase())
    }

    try {
      lettersNumbers.forEach(async letter => {
        let clip = new Audio.Sound()
        clip.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
        await clip.loadAsync(
          require('./assets/audio/'+letter+'_morse_code.ogg')
        )
        soundClips[letter] = clip
      })
    } catch(error) {
      console.error(error)
    }

    let randomIndex = Math.round(Math.random() * (sentances.length - 1))
    this.createGridLetters(sentances[randomIndex])
  }

  _onPlaybackStatusUpdate = playbackStatus => {
    if (playbackStatus.isLoaded) {
      if (playbackStatus.didJustFinish) {
        setTimeout(() => {
          this.playNextLetter()
        }, wordPauseMs)
      }
    }
  }

  createGridLetters(newSentance) {
    let randomLetters = []
    for (let i = 0; i < newSentance.length; i++) {
        if (randomLetters.indexOf(newSentance[i].toLowerCase()) == -1) {
            randomLetters.push(newSentance[i])
        }
    }

    let currentRandomizerIndex = randomLetters.length, tmp
    while (0 !== currentRandomizerIndex) {
        let randomIndex = Math.floor(Math.random() * currentRandomizerIndex)
        currentRandomizerIndex -= 1

        tmp = randomLetters[currentRandomizerIndex]
        randomLetters[currentRandomizerIndex] = randomLetters[randomIndex]
        randomLetters[randomIndex] = tmp
    }

    let tmpArr = []
    for (let i = 0; i < randomLetters.length; i++) {
        tmpArr.push(randomLetters[i].toLowerCase())
    }

    this.setState({
      currentSentance: newSentance.toLowerCase(),
      gridLetters: tmpArr,
      currentClickIndex: 0,
      points: 0,
      gameOver: false
    })
  }

  playNextLetter() {
    if (this.state.gameOver) {
      let randomIndex = Math.round(Math.random() * (sentances.length - 1))
      this.createGridLetters(sentances[randomIndex])
    } else {
      // Go to next letter
      currentIndex++
      if (this.state.currentSentance.length-1 >= currentIndex) {
          // Pause loop when a space is the current letter
          if (this.state.currentSentance[currentIndex] === ' ') {
              setTimeout(() => {
                this.playNextLetter()
              }, wordPauseMs * 3)
          } else {
              let currentLetter = this.state.currentSentance[currentIndex].replace('.', '|').replace('?', '+').replace('!', '=').toUpperCase()

              soundClips[currentLetter].playAsync()
          }
      }
    }
  }

  addPoint(letterIndex) {
    if (!this.state.gameOver) {
      if (this.state.currentSentance[this.state.currentClickIndex] == this.state.gridLetters[letterIndex]) {
        console.log('CORRECT!!')
        this.setState({ points: this.state.points + 1 })
      } else if (this.state.points > 0) {
        console.log('WRONG')
        this.setState({ points: this.state.points - 1 })
      }
      this.setState({ currentClickIndex: this.state.currentClickIndex + 1 })
      if (this.state.currentClickIndex >= this.state.currentSentance.length-1) {
        setTimeout(() => {
          alert('Du fick ' + this.state.points + ' av ' + this.state.currentSentance.length + ' poäng!')
          this.setState({ gameOver: true })
        }, 0)
      }
    }
  }

  render() {
    let views = []
    for (var i = 0; i < this.state.gridLetters.length; i++) {

      views.push(
        <TouchableHighlight key={"r" + i} onPress={this.addPoint.bind(this, i)}>
          <View style={styles.gridItem}>
            <Text style={styles.gridItemLetter}>
              {this.state.gridLetters[i]}
            </Text>
          </View>
        </TouchableHighlight>
      )
    }

    return (
      <View style={styles.app}>
          <Text>
            {'Poäng: ' + this.state.points + ' / ' + this.state.currentSentance.length}
          </Text>
          <View style={styles.grid}>
            {views}
          </View>
          <Button
            onPress={() => {currentIndex = -1;this.playNextLetter()}}
            title={this.state.gameOver ? "RESTART" : "PLAY"}
          />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  app: {
    display:'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height:'100%',
    margin:'0px',
    padding:'0px',
    width:'100%',
  },

  h1: {
    fontWeight:'normal',
    margin:'0px',
    overflow:'visible',
    padding:'0px',
  },

  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: '0 auto',
    justifyContent: 'center',
    width: '400px',
    maxWidth: '80%'
  },

  gridItem: {
    position: 'relative',
    padding: '30px',
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 2,
    width: '100px'
  },

  gridItemLetter: {
    fontSize: 50,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  play: {
    backgroundColor: 'green',
    padding: '40px'
  }
})
