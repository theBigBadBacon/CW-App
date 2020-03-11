import React from 'react'
import { Audio } from 'expo-av'
import { Button, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

// Global stuff
let wordPauseMs     = 500 // Morse code 1 time unit (period)
let currentIndex    = 0
let sentances = [
  "Do you read me over?",
  "Allmänt anrop",
  "Hur är vädret där uppe?",
]

const soundClips = {
	'A': require('./assets/audio/A_morse_code.mp3'),
	'B': require('./assets/audio/B_morse_code.mp3'),
	'C': require('./assets/audio/C_morse_code.mp3'),
	'D': require('./assets/audio/D_morse_code.mp3'),
	'E': require('./assets/audio/E_morse_code.mp3'),
	'F': require('./assets/audio/F_morse_code.mp3'),
	'G': require('./assets/audio/G_morse_code.mp3'),
	'H': require('./assets/audio/H_morse_code.mp3'),
	'I': require('./assets/audio/I_morse_code.mp3'),
	'J': require('./assets/audio/J_morse_code.mp3'),
	'K': require('./assets/audio/K_morse_code.mp3'),
	'L': require('./assets/audio/L_morse_code.mp3'),
	'M': require('./assets/audio/M_morse_code.mp3'),
	'N': require('./assets/audio/N_morse_code.mp3'),
	'O': require('./assets/audio/O_morse_code.mp3'),
	'P': require('./assets/audio/P_morse_code.mp3'),
	'Q': require('./assets/audio/Q_morse_code.mp3'),
	'R': require('./assets/audio/R_morse_code.mp3'),
	'S': require('./assets/audio/S_morse_code.mp3'),
	'T': require('./assets/audio/T_morse_code.mp3'),
	'U': require('./assets/audio/U_morse_code.mp3'),
	'V': require('./assets/audio/V_morse_code.mp3'),
	'W': require('./assets/audio/W_morse_code.mp3'),
	'X': require('./assets/audio/X_morse_code.mp3'),
	'Y': require('./assets/audio/Y_morse_code.mp3'),
	'Z': require('./assets/audio/Z_morse_code.mp3'),
	'AA': require('./assets/audio/AA_morse_code.mp3'),
	'AE': require('./assets/audio/AE_morse_code.mp3'),
	'OE': require('./assets/audio/OE_morse_code.mp3'),
	'0': require('./assets/audio/0_morse_code.mp3'),
	'1': require('./assets/audio/1_morse_code.mp3'),
	'2': require('./assets/audio/2_morse_code.mp3'),
	'3': require('./assets/audio/3_morse_code.mp3'),
	'4': require('./assets/audio/4_morse_code.mp3'),
	'5': require('./assets/audio/5_morse_code.mp3'),
	'6': require('./assets/audio/6_morse_code.mp3'),
	'7': require('./assets/audio/7_morse_code.mp3'),
	'8': require('./assets/audio/8_morse_code.mp3'),
	'9': require('./assets/audio/9_morse_code.mp3'),
	'EM': require('./assets/audio/EM_morse_code.mp3'),
	'QM': require('./assets/audio/QM_morse_code.mp3'),
	'DO': require('./assets/audio/DO_morse_code.mp3')
}

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

  async playNextLetter() {
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
              let currentLetter = this.state.currentSentance[currentIndex]
                .replace('.', 'DO')
                .replace('?', 'QM')
                .replace('!', 'EM')
                .replace('Å', 'AA')
                .replace('Ä', 'AE')
                .replace('Ö', 'OE')
                .toUpperCase()

              let soundObject = new Audio.Sound()
              soundObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
              let source = soundClips[currentLetter]
              await soundObject.loadAsync(source)
              await soundObject
                .playAsync()
                .catch(error => {
                  console.log(error)
                })
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
  },

  h1: {
    fontWeight:'normal',
    overflow:'visible'
  },

  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 400,
    maxWidth: '80%'
  },

  gridItem: {
    position: 'relative',
    padding: 30,
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 2,
    width: 100
  },

  gridItemLetter: {
    fontSize: 50,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  play: {
    backgroundColor: 'green',
    padding: 40
  }
})
