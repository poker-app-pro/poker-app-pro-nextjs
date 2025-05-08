"use client"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVertical, X } from "lucide-react"

interface Player {
  id: string
  name: string
  isNew?: boolean
}

interface DraggablePlayerListProps {
  players: Player[]
  onPlayersChange: (players: Player[]) => void
  onRemovePlayer?: (player: Player) => void
}

export function DraggablePlayerList({ players, onPlayersChange, onRemovePlayer }: DraggablePlayerListProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(players)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onPlayersChange(items)
  }

  const removePlayer = (id: string) => {
    const player = players.find((p) => p.id === id)
    if (player && onRemovePlayer) {
      onRemovePlayer(player)
    } else {
      onPlayersChange(players.filter((player) => player.id !== id))
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="players">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {players.map((player, index) => (
              <Draggable key={player.id} draggableId={player.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3"
                  >
                    <div className="flex items-center">
                      <div {...provided.dragHandleProps} className="mr-3 cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{player.name}</span>
                          {player.isNew && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">New</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {players.length === 0 && (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
                <p className="text-muted-foreground">No players added yet</p>
                <p className="text-sm text-muted-foreground">Use the search box above to add players</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
