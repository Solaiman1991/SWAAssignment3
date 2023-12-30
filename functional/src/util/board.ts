export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}    

export type Match<T> = {
    matched: T,
    positions: Position[]
}    

export type Board<T> = {
    width: number,
    height: number,
    tiles: Tile<T>[]
};

export type Effect<T> = {
    kind: T,
    match: Match<T>,
    board: Board<T>
};

export type MoveResult<T> = {
    board: Board<T>,
    effects: Effect<T>[]
}    

export function create<T>(generator: Generator<T>, width: number, height: number): Board<T> {
    const tempBoard = {
        width: width,
        height: height,
        tiles: generateTiles<T>(generator, width, height)
    }
    const matches = findMatches(tempBoard)
    const {board}= processMove(generator, tempBoard, matches)
    return board
}    

export function piece<T>(board: Board<T>, p: Position): T | undefined {
    const tile = getTileByPosition(board, p)
    if (!tile) return
    return tile.value
}    

export function positions<T>(board: Board<T>): Position[] {
    return board.tiles.map(tile => tile.position)
}

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
    if (isDiagonalMove(first, second)) return false

    const tempTiles = swapTiles(board, first, second)
    const tempBoard = createTempBoard(board, tempTiles)
    const matches = findMatches(tempBoard)
    
    if (matches.length === 0) {
        return false
    }
    return true
}

export function move<T>(generator: Generator<T>, board: Board<T>, first: Position, second: Position): MoveResult<T> {
    if (!canMove(board, first, second)) {
        return {board: board, effects: []}
    }
    
    const newTiles = swapTiles(board, first, second)
    const tempBoard = createTempBoard(board, newTiles)
    const matches = findMatches(tempBoard)
    return processMove(generator,tempBoard, matches)
}

type Tile<T> = {
    value: T,
    position: Position
}
function createTempBoard<T>(board: Board<T>, tiles: Tile<T>[]): Board<T>{
    return {...board, tiles: tiles}
}

const createPosition = (row: number, col:number): Position => {
    return {row: row, col: col}
}

const positionsEqual = (first: Position, second: Position) => first.col === second.col && first.row === second.row

const createEffect = <T>(kind: string, match: Match<T> | null, board: Board<T> | null):Effect<T> => {
    if (kind === "Match"){
        return {
            kind: kind as T,
            match: match
        } as Effect<T>
    } else {
        return {
            kind: kind as T,
            match: match,
            board: board            
        }
    }
}

const createHorisontalMatchPositions = (matchCount: number, rowIndex: number, colIndex:number) => 
    Array.from({length: matchCount}, (_, i) =>{
    const col = colIndex - i
    return createPosition(rowIndex, col)
}).sort((a,b) => a.col - b.col)

const createVerticalMatchPositions = (matchCount: number, rowIndex: number, colIndex:number) => 
    Array.from({length: matchCount}, (_, i) => {
    const row = rowIndex - i
    return createPosition(row, colIndex)
}).sort((a,b) => a.row - b.row)

const createMatch = <T>(
    matchOn: T, 
    matchCount: number, 
    rowIndex: number, 
    colIndex: number, 
    fn: (matchCount: number, rowIndex: number, colIndex: number) => Position[]
): Match<T> => {
    return {
        matched: matchOn,
        positions: fn(matchCount, rowIndex, colIndex)
    }
}

const findMatches = <T>(board: Board<T>): Match<T>[] => {
    const hMatches = getHorisontalMatches(board)
    const vMatches = getVerticalMatches(board)
    return [...hMatches, ...vMatches]
}

const generateTile = <T>(generator: Generator<T>, row: number, col: number): Tile<T> => {
    return {
        value: generator.next(),
        position: createPosition(row, col)
    }
}
const generateTiles = <T>(generator: Generator<T>, width: number, height: number): Tile<T>[] => 
    Array.from({length: height}, (_, row) => 
        Array.from({length: width}, (_, col) => generateTile(generator, row, col))
    ).flat()

const getTileByPosition = <T>(board: Board<T>, p: Position): Tile<T> => 
    board.tiles.find(t => t.position.col === p.col && t.position.row === p.row)

const setTile = <T>(board: Board<T>, p: Position, value: T) => {
    return board.tiles.map(tile => {
        if (tile.position.col !== p.col || tile.position.row !== p.row){
            return tile
        } 
        return {value: value, position: p}
    })
}

const boardIsFull = <T>(board: Board<T>) => !board.tiles.some(tile => tile.value === "*")
const isDiagonalMove = (first: Position, second: Position) => first.col !== second.col && first.row !== second.row
const tileHasValue = <T>(tile: Tile<T>) => tile.value !== "*"

const tileRight = <T>(board: Board<T>, tile: Tile<T>) => getTileByPosition(board, {row: tile.position.row, col: tile.position.col + 1})
const isTileRightUndefined = <T>(board: Board<T>, currentTile: Tile<T>) => !tileRight(board,currentTile)
const isTileRightMatch = <T>(board: Board<T>, currentTile: Tile<T>) => {
    const right = tileRight(board, currentTile)
    if (!right) return false
    return right.value === currentTile.value
}

const tileBeneath = <T>(board: Board<T>, tile: Tile<T>) => getTileByPosition(board, {row: tile.position.row + 1, col: tile.position.col})
const isTileBeneathUndefined = <T>(board: Board<T>, currentTile: Tile<T>) => !tileBeneath(board, currentTile)
const isTileBelowMatch = <T>(board: Board<T>, currentTile: Tile<T>) => {
    const beneath = tileBeneath(board, currentTile)
    if (!beneath) return false
    return beneath.value === currentTile.value
}

function removeTiles<T>(board: Board<T>, tiles: Position[]): Board<T>{
    function helper(boardN: Board<T>, tiles: Position[]){
        if (tiles.length === 0) {
            return boardN
        }
        const [head, ...tail] = tiles
        const newTiles = setTile(boardN, head, "*" as T)
        const newBoard = createTempBoard(boardN, newTiles)
        return helper(newBoard, tail)
    }
    return helper(board, tiles)
} 

function swapTiles<T>(board: Board<T>, first: Position, second: Position): Tile<T>[] {
    return board.tiles.map(tile => {
        if (positionsEqual(tile.position, first)){
            return {value: piece(board, second), position: tile.position}
        }
        if (positionsEqual(tile.position, second)){
            return {value: piece(board, first), position: tile.position}
        }
        return tile;
    })
}

const transposeBoard = <T>(board:Board<T>) => {
    return Array.from({length: board.width}, (_, i) => 
        board.tiles.filter(tile => tile.position.col === i)
    ).flat()
}

function getVerticalMatches<T>(board: Board<T>): Match<T>[] {
    const newTiles = transposeBoard(board)
    const newBoard = createTempBoard(board, newTiles)
    function helper(tiles: Tile<T>[], matches: Match<T>[], matchCount: number, matchOnValue: T): Match<T>[] {      
        const [head, ...tail] = tiles;
        if (!head) {
            return matches;
        }

        if (tail.length === 0 && matchCount < 3) {
            return matches;
        }

        if (tail.length === 0 && matchCount >= 3) {
            const newMatch = createMatch(matchOnValue, matchCount, head.position.row, head.position.col, createVerticalMatchPositions);
            return [...matches, newMatch];
        }

        if (isTileBeneathUndefined(newBoard, head) && matchCount < 3) {
            return helper(tail, matches, 1, tail[0].value);
        }

        if (isTileBeneathUndefined(newBoard, head) && matchCount >= 3) {
            const newMatch = createMatch(matchOnValue, matchCount, head.position.row, head.position.col, createVerticalMatchPositions);
            return helper(tail, [...matches, newMatch], 1, tail[0].value);
        }

        if (isTileBelowMatch(newBoard, head)) {
            return helper(tail, matches, matchCount + 1, tail[0].value);
        }

        if (matchCount >= 3) {
            const newMatch = createMatch(matchOnValue, matchCount, head.position.row, head.position.col, createVerticalMatchPositions);
            return [...matches, newMatch];
        }

        return helper(tail, matches, 1, tail[0].value);
    }
    return helper(newBoard.tiles, [], 1, newBoard.tiles[0].value);
}

function getHorisontalMatches<T>(board: Board<T>): Match<T>[] {
    const tempBoard = {...board}
    function helper(tiles: Tile<T>[], matches: Match<T>[], matchCount: number, matchOnValue: T): Match<T>[] {      
        const [head, ...tail] = tiles;
        if (!head) {
            return matches;
        }

        if (tail.length === 0 && matchCount < 3) {
            return matches;
        }

        if (tail.length === 0 && matchCount >= 3) {
            const newMatch = createMatch(matchOnValue, matchCount, head.position.row, head.position.col, createHorisontalMatchPositions);
            return [...matches, newMatch];
        }

        if (isTileRightUndefined(tempBoard, head) && matchCount < 3) {
            return helper(tail, matches, 1, tail[0].value);
        }

        if (isTileRightUndefined(tempBoard, head) && matchCount >= 3) {
            const newMatch = createMatch(matchOnValue, matchCount, head.position.row, head.position.col, createHorisontalMatchPositions);
            return helper(tail, [...matches, newMatch], 1, tail[0].value);
        }

        if (isTileRightMatch(tempBoard, head)) {
            return helper(tail, matches, matchCount + 1, tail[0].value);
        }

        if (matchCount >= 3) {
            const newMatch = createMatch(matchOnValue, matchCount, head.position.row, head.position.col, createHorisontalMatchPositions);
            return [...matches, newMatch];
        }

        return helper(tail, matches, 1, tail[0].value);
    }
    return helper(tempBoard.tiles, [], 1, tempBoard.tiles[0].value);
}

function refill<T>(generator: Generator<T>, board: Board<T>): Board<T>{
    function helper(generator: Generator<T>, currentBoard: Board<T>, currentCol: number){
        const nextCol = (currentCol + 1) % currentBoard.width
        if (boardIsFull(currentBoard)) return currentBoard

        const tile = getTileByPosition(currentBoard, {row: 0, col: currentCol})
        if (tileHasValue(tile)){
            return helper(generator, currentBoard, nextCol)
        }

        const updatedTile = {...tile, value: generator.next()}
        const updatedTiles = setTile(currentBoard, tile.position, updatedTile.value)
        const updatedBoard = createTempBoard(currentBoard, updatedTiles)
        const shiftedBoard = shiftDownTiles(updatedBoard)
        
        return helper(generator, shiftedBoard, nextCol)
    }
    return helper(generator, board, 0)
}

function processMove<T>(generator: Generator<T>, board: Board<T>, matches: Match<T>[]): MoveResult<T>{
    
    function helper(generator: Generator<T>, currentBoard: Board<T>, currentMatches: Match<T>[], currentEffects: Effect<T>[]): MoveResult<T>{
        if (currentMatches.length === 0){
            return {board: currentBoard, effects: currentEffects}
        }
        
        const matchEffects = currentMatches.map((match) => {
            return createEffect("Match", match, currentBoard)
        })
        const tiles = currentMatches.flatMap(match => [...match.positions])
        const removedTiles = removeTiles(currentBoard, tiles)
        const shiftedBoard = shiftDownTiles(removedTiles)
        const refilledBoard = refill(generator, shiftedBoard)
        const refillEffect = createEffect("Refill", null, refilledBoard)
        const effects = [...currentEffects, ...matchEffects, refillEffect]
        const newMatches = findMatches(refilledBoard)
        return helper(generator, refilledBoard, newMatches, effects)
    }
    return helper(generator, board, matches, [])
}

function shiftDownTiles<T>(board: Board<T>): Board<T>{
    const newBoard = createTempBoard(board, board.tiles)
    function helper(board: Board<T>, tiles: Tile<T>[], currentIndex: number): Board<T>{
        const [head, ...tail] = tiles
        if (!head) return board

        const newBoard = handleFloaters(board, head.position)
        return helper(newBoard, tail, currentIndex++)
    }
    const reversedTiles = newBoard.tiles.reverse()
    const result = helper(board, reversedTiles, 0)
    return createTempBoard(result, result.tiles.reverse())
}

function handleFloaters<T>(board: Board<T>, p: Position): Board<T>{
    const tile = getTileByPosition(board, p)
    const positionBelow = {row: tile.position.row + 1, col: tile.position.col}
    const tileValueBelow = piece(board, positionBelow)

    if (tileValueBelow === "*"){
        const newTiles = swapTiles(board, positionBelow, tile.position)
        const newBoard = createTempBoard(board, newTiles)
        return handleFloaters(newBoard, positionBelow)
    }
    return board    
}
