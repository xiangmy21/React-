import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  let style = null;
  if (props.highlight) style = {color: 'red'};
  return (
    <button className="square" onClick={props.onClick} style={style}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={this.props.highlights.includes(i)}
      />
    );
  }
  render() {
    return <div>{
      [0, 1, 2].map(
        (i) => <div className='board-row'>{
            [0, 1, 2].map((j) => this.renderSquare(i*3+j))
          }</div>
      )
    }</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        coordinate: '',
      }],
      xIsNext: true,
      stepNumber: 0,
      order: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i])
      return;
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    let coordinate = squares[i] + '(' + parseInt(i/3) + ',' + (i%3) + ')';
    this.setState({
      history: history.concat([{squares: squares, coordinate: coordinate}]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    })
  }
  changeOrder() {
    this.setState({
      order: !this.state.order,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    let status, highlights=[];
    if (winner) {
      status = 'Winner: ' + winner.player;
      highlights = winner.position;
    }
    else if (this.state.stepNumber < 9) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    else status = 'It\'s a tie!';

    const moves = history.map((step, move) => {
      const desc = (move ? 
        'Go to move #' + move :
        'Go to game start') + ' ' + step.coordinate;
      let textStyle = {};
      if (move === this.state.stepNumber) {
        if (winner) textStyle = {color: 'red', fontWeight: 'bold'};
        else textStyle = {fontWeight: 'bold'};
      }
      return (
        <li>
          <button onClick={() => this.jumpTo(move)} style={textStyle}>{desc}</button>
        </li>
      )
    });
    if (this.state.order) moves.reverse();

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            highlights={highlights}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.changeOrder()}>{this.state.order?'▲':'▼'}</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {player: squares[a], position: lines[i]};
    }
  }
  return null;
}