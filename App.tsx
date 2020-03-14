import React from 'react'
import { Audio } from 'expo-av'
import { Button, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';

// Global stuff
const victoryFactor = 3 // Simple level check for increasing difficulty
let wordPauseMs     = 500 // Morse code 1 time unit (period)
let difficulty      = 2
let correctAnswers  = 0
let inputDisabled   = false
let soundObject     = new Audio.Sound()
let loadedSounds    = []

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
	'Å': require('./assets/audio/AA_morse_code.mp3'),
	'Ä': require('./assets/audio/AE_morse_code.mp3'),
	'Ö': require('./assets/audio/OE_morse_code.mp3'),
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
	'!': require('./assets/audio/EM_morse_code.mp3'),
	'?': require('./assets/audio/QM_morse_code.mp3'),
	'.': require('./assets/audio/DO_morse_code.mp3')
}
let alphabet = [
  'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
	'Å',
	'Ä',
	'Ö',
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'!',
	'?',
	'.'
]

interface AppState {
  gridLetters: string[],
  letters: string[],
  currentLetter: string,
  points: number,
  gameOver: boolean
}

export default class App extends React.Component<{}, AppState> {

  constructor(props){
    super(props)
    this.state={
      gridLetters:["D", "e", "m", "o"],
      letters: [],
      currentLetter:'',
      points: 0,
      gameOver: false
    }
  }

  async componentDidMount() {
    this.createGridLetters()
    // soundObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
    // for (const clip in soundClips) {
    //   let tmp = new Audio.Sound()
    //   tmp.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
    //   tmp.loadAsync(soundClips[clip])
    //   soundClips[clip] = tmp
    // }
  }

  _onPlaybackStatusUpdate = playbackStatus => {
    if (playbackStatus.isLoaded) {
      if (playbackStatus.didJustFinish) {
        setTimeout(() => {
          inputDisabled = false
          let tmp = []
          for (let i = 0; i < this.state.letters.length; i++) {
            tmp.push('')
          }
          this.setState({ letters: tmp })
        }, wordPauseMs)
      }
    }
  }

  createGridLetters() {
    let randomLetters = []
    // Increase difficulty if accuuracy is 100%
    if (this.state.points >= difficulty && difficulty < alphabet.length-1) {
      console.log('Increasing difficulty', 'TODO: Show level up effect')
      difficulty++
      this.setState({ points: 0 })
    }
    let gridSize = difficulty
    if (gridSize < 9) {
      gridSize = 9
    }
    let tmpArr = []
    let hm = []
    for (let i = 0; i < gridSize; i++) {
        let randomIndex = Math.floor(Math.random() * difficulty)
        randomLetters.push(alphabet[randomIndex])
        tmpArr.push(randomLetters[i].toUpperCase())
        hm.push('')
    }

    let currentRandomizerIndex = randomLetters.length
    let tmp = ''
    while (0 !== currentRandomizerIndex) {
        let randomIndex = Math.floor(Math.random() * currentRandomizerIndex)
        currentRandomizerIndex -= 1

        tmp = randomLetters[currentRandomizerIndex]
        randomLetters[currentRandomizerIndex] = randomLetters[randomIndex]
        randomLetters[randomIndex] = tmp
    }

    let randomIndex = Math.floor(Math.random() * difficulty)

    this.setState({
      gridLetters: tmpArr,
      currentLetter: alphabet[randomIndex],
      letters: hm
    })
  }

  async playNewLetter() {
    if (correctAnswers >= difficulty * victoryFactor) {
      this.createGridLetters()
      this.playNewLetter()
    } else {
      // Pause loop when a space is the current letter
      if (this.state.currentLetter === ' ') {
          setTimeout(() => {
          }, wordPauseMs * 3)
      } else {
          let soundObject = new Audio.Sound()
          soundObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
          let source = soundClips[this.state.currentLetter]
          await soundObject.loadAsync(source)
          await soundObject.setPositionAsync(0)
          await soundObject
            .playAsync()
            .catch(error => {
              console.log(error)
            })
      }
    }
  }

  async checkAnswer(clickedIndex) {
    let clickedLetter = this.state.gridLetters[clickedIndex]
    // console.log('Checking answer!',this.state.currentLetter,clickedLetter)
    inputDisabled = true
    let tmp = this.state.letters

    if (this.state.currentLetter == clickedLetter) {
      correctAnswers++
      tmp[clickedIndex] = 'correct'
      this.setState({
        points: this.state.points + 1,
        letters: tmp
      })
    } else {
      correctAnswers = 0
      tmp[clickedIndex] = 'wrong'
      this.setState({
        points: 0,
        letters: tmp
      })
    }
    // Go to next letter
    let randomIndex = Math.floor(Math.random() * difficulty)
    while (this.state.gridLetters[alphabet[randomIndex]] == -1) {
      randomIndex = Math.floor(Math.random() * difficulty)
    }
    await this.setState({ currentLetter: alphabet[randomIndex] })
    console.log('new letter is',randomIndex, alphabet[randomIndex], this.state.currentLetter)
    this.playNewLetter()
  }

  render() {
    let rows = []
    let loopIndex = 0
    for (var row = 0; row < this.state.gridLetters.length / 3; row++) {
      let items = []
      for (var cell = 0; cell < this.state.gridLetters.length / 3; cell++) {
        items.push(
          <TouchableHighlight underlayColor={'blue'} key={'r'+row+':'+cell} onPress={this.checkAnswer.bind(this, loopIndex)} disabled={inputDisabled} style={ (this.state.letters[loopIndex] == 'correct' ? styles.isCorrect : (this.state.letters[loopIndex] == 'wrong' ? styles.isWrong : null)) }>
            <View style={styles.gridItem}>
              <Text style={styles.gridItemLetter}>
                {this.state.gridLetters[loopIndex]}
              </Text>
            </View>
          </TouchableHighlight>
        )
        loopIndex++
      }
      rows.push(
        <View style={styles.gridRow} key={'row'+row}>
          {items}
        </View>
      )
    }

    return (
      <LinearGradient
          colors={['#A7A7A7','#E4E4E4']}
          style={styles.app}>
          <Text>
            {'Rätta svar: ' + this.state.points}
          </Text>
          <View style={styles.grid}>
            {rows}
          </View>
          <Button
            title="Play Sound"
            onPress={() => {this.playNewLetter()}}
          />
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  app: {
    display:'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },

  h1: {
    fontWeight:'normal',
    overflow:'visible'
  },

  grid: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: 30
  },

  gridRow: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row'
  },

  gridItem: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 2,
    width: 80,
    height: 80,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 16
  },

  gridItemLetter: {
    position: 'relative',
    fontSize: 50,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },

  isCorrect: {
    backgroundColor: 'green'
  },

  isWrong: {
    backgroundColor: 'red'
  },

  play: {
    backgroundColor: 'green',
    padding: 40
  }
})
