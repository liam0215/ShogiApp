import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const GameScreen = () => {
  // Initialize your board state and other state variables here
  const initialBoard = [
    ['+L', '+N', '+S', '+G', '+K', '+G', '+S', '+N', '+L'],
    [null, '+R', null, null, null, null, null, '+B', null],
    ['+P', '+P', '+P', '+P', '+P', '+P', '+P', '+P', '+P'],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    ['-P', '-P', '-P', '-P', '-P', '-P', '-P', '-P', '-P'],
    [null, '-B', null, null, null, null, null, '-R', null],
    ['-L', '-N', '-S', '-G', '-K', '-G', '-S', '-N', '-L'],
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<{
  row: number;
  col: number;
  } | null>(null);

  const isKingMoveValid = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
  
    return (rowDiff === 1 || rowDiff === 0) && (colDiff === 1 || colDiff === 0);
  };

  const isPawnMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    currentPlayer: '+' | '-'
  ) => {
    // A Pawn can only move straight forward (Sente: +1 row, Gote: -1 row)
    const rowDirection = currentPlayer === '+' ? 1 : -1;
  
    return fromCol === toCol && toRow === fromRow + rowDirection;
  };
  
  const isBishopMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    board: string[][]
  ) => {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
  
    // A Bishop can only move diagonally
    if (rowDiff !== colDiff) {
      return false;
    }
  
    // Check if there are any pieces blocking the path
    const rowDirection = toRow > fromRow ? 1 : -1;
    const colDirection = toCol > fromCol ? 1 : -1;
  
    let currentRow = fromRow + rowDirection;
    let currentCol = fromCol + colDirection;
  
    while (currentRow !== toRow && currentCol !== toCol) {
      if (board[currentRow][currentCol]) {
        return false;
      }
  
      currentRow += rowDirection;
      currentCol += colDirection;
    }
  
    return true;
  };

  const isRookMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    board: string[][]
  ) => {
    // A Rook can only move horizontally or vertically
    if (fromRow !== toRow && fromCol !== toCol) {
      return false;
    }
  
    // Check if there are any pieces blocking the path
    const rowDirection = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colDirection = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);
  
    let currentRow = fromRow + rowDirection;
    let currentCol = fromCol + colDirection;
  
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol]) {
        return false;
      }
  
      currentRow += rowDirection;
      currentCol += colDirection;
    }
  
    return true;
  };

  const isGoldGeneralMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    currentPlayer: '+' | '-'
  ) => {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
  
    // A Gold General can only move to an adjacent square, except diagonally backward
    const rowDirection = currentPlayer === '+' ? 1 : -1;
    const isForwardMove = rowDirection === (toRow - fromRow);
  
    return (
      (rowDiff === 1 && colDiff === 0) || // Vertical move
      (rowDiff === 0 && colDiff === 1) || // Horizontal move
      (isForwardMove && rowDiff === 1 && colDiff === 1) // Diagonal forward move
    );
  };

  const isSilverGeneralMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    currentPlayer: '+' | '-'
  ) => {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
  
    // A Silver General can move one square diagonally or one square forward
    const rowDirection = currentPlayer === '+' ? 1 : -1;
    const isForwardMove = rowDirection === (toRow - fromRow);
  
    return (
      (isForwardMove && colDiff === 0) || // Vertical forward move
      (rowDiff === 1 && colDiff === 1) // Diagonal move
    );
  };

  const isKnightMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    currentPlayer: '+' | '-'
  ) => {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
  
    // A Knight can move like an "L" (1 square horizontally and 2 squares forward or vice versa)
    const rowDirection = currentPlayer === '+' ? 1 : -1;
    const isForwardMove = rowDirection * 2 === (toRow - fromRow);
  
    return isForwardMove && colDiff === 1;
  };
  
  const isLanceMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    board: string[][],
    currentPlayer: '+' | '-'
  ) => {
    // A Lance can only move forward vertically
    const rowDirection = currentPlayer === '+' ? 1 : -1;
    if (fromCol !== toCol || (toRow - fromRow) * rowDirection <= 0) {
      return false;
    }
  
    // Check if there are any pieces blocking the path
    const rowStep = rowDirection;
    let currentRow = fromRow + rowStep;
  
    while (currentRow !== toRow) {
      if (board[currentRow][fromCol]) {
        return false;
      }
      currentRow += rowStep;
    }
  
    return true;
  };  

  const canPromote = (
    fromRow: number,
    toRow: number,
    pieceType: string,
    currentPlayer: '+' | '-'
  ) => {
    // Pawns, Knights, and Lances must promote if they enter the furthest rank
    const mandatoryPromotion = ['P', 'N', 'L'].includes(pieceType) &&
      ((currentPlayer === '+' && toRow === 8) || (currentPlayer === '-' && toRow === 0));
  
    // Silver Generals, Bishops, and Rooks can promote in the promotion zone (last 3 ranks)
    const optionalPromotion = ['S', 'B', 'R', 'P', 'N', 'L'].includes(pieceType) &&
      (currentPlayer === '+'
        ? fromRow >= 6 || toRow >= 6
        : fromRow <= 2 || toRow <= 2);
  
    return mandatoryPromotion || optionalPromotion;
  };

  const isPromotedBishopMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    board: string[][],
  ): boolean => {
    // Check if it moves like a regular Bishop or one square orthogonally
    return (
      isBishopMoveValid(fromRow, fromCol, toRow, toCol, board) ||
      isKingMoveValid(fromRow, fromCol, toRow, toCol)
    );
  };
  
  const isPromotedRookMoveValid = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    board: string[][],
  ): boolean => {
    // Check if it moves like a regular Rook or one square diagonally
    return (
      isRookMoveValid(fromRow, fromCol, toRow, toCol, board) ||
      isKingMoveValid(fromRow, fromCol, toRow, toCol)
    );
  };

  const handleSquarePress = (row: number, col: number) => {
    const piece = board[row][col];
  
    // Deselect the piece if the same square is clicked again
    if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
      setSelectedPiece(null);
      return;
    }
  
    // If no piece is selected and the clicked square has a piece, select the piece
    if (!selectedPiece && piece) {
      setSelectedPiece({ row, col });
      return;
    }
  
    // If a piece is selected and the clicked square is empty or has an opponent's piece, move the piece
    if (selectedPiece && (!piece || piece[0] !== board[selectedPiece.row][selectedPiece.col][0])) {
      // Implement move validation and game logic here
      const fromRow = selectedPiece.row;
      const fromCol = selectedPiece.col;
      const piece = board[fromRow][fromCol];
      const pieceType = piece[piece.length - 1];
      const currentPlayer = piece[0];
      const promoted = piece.length === 3;

      let isMoveValid = false;
      // Check if the move is valid based on the piece type
      switch (pieceType) {
        case 'K': // King
          isMoveValid = isKingMoveValid(fromRow, fromCol, row, col);
          break;
        case 'P': // Pawn
          isMoveValid = isPawnMoveValid(fromRow, fromCol, row, col, currentPlayer);
          break;
        case 'B': // Bishop
          isMoveValid = isBishopMoveValid(fromRow, fromCol, row, col, board);
          break;
        case 'R': // Rook
          isMoveValid = isRookMoveValid(fromRow, fromCol, row, col, board);
          break;
        case 'G': // Gold General
          isMoveValid = isGoldGeneralMoveValid(fromRow, fromCol, row, col, currentPlayer);
          break;
        case 'S': // Silver General
          isMoveValid = isSilverGeneralMoveValid(fromRow, fromCol, row, col, currentPlayer);
          break;
        case 'N': // Knight
          isMoveValid = isKnightMoveValid(fromRow, fromCol, row, col, currentPlayer);
          break;
        case 'L': // Lance
          isMoveValid = isLanceMoveValid(fromRow, fromCol, row, col, board, currentPlayer);
          break;
      }
      if(promoted) {
        switch (pieceType) {
          case 'P': // Pawn
          case 'L': // Lance
          case 'N': // Knight
          case 'S': // Silver General
            isMoveValid = isGoldGeneralMoveValid(fromRow, fromCol, row, col, currentPlayer);
            break;
          case 'B': // Bishop
            isMoveValid = isPromotedBishopMoveValid(fromRow, fromCol, row, col, board);
            break;
          case 'R': // Rook
            isMoveValid = isPromotedRookMoveValid(fromRow, fromCol, row, col, board);
            break;
        }
      }

      // If the move is valid, update the board state
      if (isMoveValid) {
        // Update board state and handle captures/promotions
        // const newBoard = board.map(row => row.slice());
        // newBoard[row][col] = board[fromRow][fromCol];
        const newBoard = board.map(row => row.slice());
        newBoard[fromRow][fromCol] = null;
        // newBoard[row][col] = board[fromRow][fromCol];

        // Check if the piece can be promoted
        if (canPromote(fromRow, row, pieceType, currentPlayer)) {
          // Ask the player if they want to promote the piece (if promotion is optional)
          // For now, let's assume the player always promotes if possible
          const promotedPiece = pieceType === 'S' ? 'G' : '+' + pieceType;

          // Place the promoted piece on the destination square
          newBoard[row][col] = currentPlayer + promotedPiece;
        } else {
          // Place the original piece on the destination square
          newBoard[row][col] = board[fromRow][fromCol];
        }

    
        setBoard(newBoard);
        setSelectedPiece(null);
      }
    }
  };
  

  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col];
    const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
    const promoted = (piece !== null &&  piece[1] === '+')

    return (
      <TouchableOpacity
        key={col}
        style={[
          styles.square,
          isSelected ? styles.selectedSquare : null,
        ]}
        onPress={() => handleSquarePress(row, col)}
      >
        {piece && <Text style={promoted ? styles.promoted : styles.piece}>{promoted ? piece[0] + piece[2] : piece}</Text>}
      </TouchableOpacity>
    );
  };
  

  const renderBoard = () => {
    const board = [];
  
    for (let row = 0; row < initialBoard.length; row++) {
      const boardRow = [];
  
      for (let col = 0; col < initialBoard[row].length; col++) {
        boardRow.push(renderSquare(row, col));
      }
  
      board.push(
        <View key={row} style={styles.boardRow}>
          {boardRow}
        </View>
      );
    }
  
    return <View style={styles.board}>{board}</View>;
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shogi Game</Text>
      {renderBoard()}
      {/* Render other game elements like captured pieces, player names, etc. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  board: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#000',
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9A234',
  },
  piece: {
    fontSize: 24,
  },
  selectedSquare: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  promoted: {
    fontSize: 24,
    color: '#E0041B',
  },
  // Add other styles for your game screen components
});

export default GameScreen;
