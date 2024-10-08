import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import {
  DndContext,
  // PointerSensor,
  useSensor,
  useSensors,
  // MouseSensor,
  // TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DnDKitSensors'
import { useEffect, useState, useCallback, useRef } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { cloneDeep, isEmpty } from 'lodash'
import { genaratePlaceholderCard } from '~/utilities/formatters'

// import phần tử giữ chỗ cho DragOverlay
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}


function BoardContent({ board, moveColumns, moveCards, moveCardtoDifferentColumn }) {
  // https://docs.dndkit.com/api-documentation/sensors
  // PointerSensor là mặc định thì phải có thuộc tính CSS touch-action: 'none': ở phần tử được kéo thả nhưng gặp bug
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  // Require the mouse to move by 10 pixels before activating, fix click call event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  // Nhấn giữ 250ms và tolerance(dung sai) của cảm ứng (di chuyển lệch) 5px thì kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })

  // const Sensor = useSensors(pointerSensor)
  const Sensor = useSensors(mouseSensor, touchSensor)

  const [orderedColumnState, setorderedColumnState] = useState([])

  // Tại cùng 1 thời điểm chỉ có 1 id được kéo
  const [activeDragItemId, setActiveDragItemId] = useState([null])
  const [activeDragItemType, setActiveDragItemType] = useState([null])
  const [activeDragItemData, setActiveDragItemData] = useState([null])
  const [oldColumWhenDraggingCard, setoldColumWhenDraggingCard] = useState([null])

  // Điểm va chạm cuối cùng (xử lý cho việc phát hiện va chạm)
  const lastOverId = useRef(null)
  useEffect(() => {
    // Column đã được sắp xếp ở component cha cao nhất (board/_id.jsx)
    setorderedColumnState(board.columns)
  }, [board])

  // Tìm 1 cái Column dựa trên CardId đã có
  const findColumnByCardId = (cardId) => {
    // ** Sử dụng column.cards thay vì column.cardOrderIds vì ở bước handleDragOver chúng ta sẽ
    // làm dữ liệu cho cards hoàn chỉnh trước rồi mới sắp xếp lại dữ liệu để tạo ra cardOrderIds mới
    // ** Đi vào mảng Column -> tìm column chứa 1 mảng card -> map mảng vừa tìm thấy, để thành một mảng mới
    // , mảng này sẽ chứa toàn bộ các _id của card, sau đó kiểm tra xem mảng đó có chứa cardId được truyền vào không
    return orderedColumnState.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Function chung xử lý việc cập nhật state khi kéo thả card giữa các column
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setorderedColumnState(prevColumns => {
      // Tìm vị trí (index) của overCard trong column đích (nơi mà Card sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán cardIndex mới (xác định vị trí trên dưới của overCard) nhưng ko hiểu sao translated = null mà code vẫn chạy :))
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0

      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // console.log('isBelowOverItem: ', isBelowOverItem)
      // console.log('modifier: ', modifier)
      // console.log('overCardIndex: ', overCardIndex)

      // Đoạn này cài gói loDash, mục đích là clone mảng orderedColumnState cũ ra một cái mới
      // để xử lý data rồi return, cập nhật lại orderedColumnState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // Cái column cũ bị kéo
      if (nextActiveColumn) {
        // Xoá card ở column cũ (column active)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Thêm card rỗng (Placeholder) vào vị trí cũ của card đang kéo
        if (isEmpty(nextActiveColumn.cards)) {
          // console.log('Card rỗng')
          nextActiveColumn.cards = [genaratePlaceholderCard(nextActiveColumn)]
        }
        // Cập nhật lại mảng cardOrderIds trong dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // Cái column mới được kéo tới
      if (nextOverColumn) {
        // Kiểm tra card đang kéo có tồn tại ở overColumn chưa, nếu có thì cần xoá nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Cập nhật lại columnId cho card đang kéo
        const rebuilt_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Thêm card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuilt_activeDraggingCardData)

        // Xoá Placeholder card nếu có
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        // Cập nhật lại mảng cardOrderIds trong dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      if (triggerFrom === 'handleDragEnd') {
        // Gọi hàm moveCardtoDifferentColumn nằm ở component cha cao nhất (board/_id.jsx)
        moveCardtoDifferentColumn(activeDraggingCardId, oldColumWhenDraggingCard._id, nextOverColumn._id, nextColumns)
      }
      return nextColumns
    })
  }
  // Khi bắt đầu kéo 1 phần tử là column hoặc card
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    // Nếu tồn tại columnId thì set kiểu cho ACTIVE_DRAG_ITEM_TYPE là CardId và ngược lại là ColumnId
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data.current)

    // Nếu đang kéo card thì lưu lại column cũ của card đó
    if (event?.active?.data?.current?.columnId) {
      setoldColumWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Đang trong quá trình kéo phần tử là column hoặc card
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // Nếu không xảy ra if ở trên thì xử lý hành động kéo card qua lại giữa các column
    // console.log('handleDragOver: ', event)

    const { active, over } = event

    // Nếu ko tồn tại active or over thì return để tránh lỗi
    if (!active || !over) return

    // activeDraggingCard là card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard là card đang được tương tác trên hoặc dưới so với card đang được kéo (activeDraggingCard)
    const { id: overCardId } = over

    // Tìm 2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)
    // console.log('activeColumn: ',activeColumn)
    // console.log('overColumn: ',overColumn)

    // Tránh lỗi không tồn tại 1 trong 2 column
    if (!activeColumn || !overColumn) return

    // Khi kéo card qua 2 column khác nhau thì mới xử lý logic, còn nếu kéo card trong
    // column của nó thì không xử lý.
    // Đây là xử lý lúc đang kéo (over), không liên quan đến việc sát nhập dữ liệu ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  // Khi bắt đầu thả 1 phần tử là column hoặc card
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    // Sử dụng cú pháp destructuring để lấy hai thuộc tính active và over từ đối tượng event
    const { active, over } = event

    // Nếu ko tồn tại active or over thì return để tránh lỗi
    if (!active || !over) return

    // Nếu kéo card thì chạy
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard là card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard là card đang được tương tác trên hoặc dưới so với card đang được kéo (activeDraggingCard)
      const { id: overCardId } = over

      // Tìm 2 cái column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)
      // console.log('activeColumn: ',activeColumn)
      // console.log('overColumn: ',overColumn)

      // Tránh lỗi không tồn tại 1 trong 2 column
      if (!activeColumn || !overColumn) return

      // Hành động kéo card qua lại giữa 2 column khác nhau
      // Có thể dùng activeDragItemData.columnId để so sánh với overColumn._id hoặc oldColumWhenDraggingCard._id
      // (set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd này
      // vì khi đi qua onDragOver thì state của card đã bị cập nhật 1 lần rồi.
      if (oldColumWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        // Hành động kéo card trong cùng 1 column

        // Lấy vị trí cũ của oldColumWhenDraggingCard
        const oldCardIndex = oldColumWhenDraggingCard?.cards?.findIndex(c => c._id == activeDragItemId)
        // Lấy vị trí mới của overColumn
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id == overCardId)
        // Dùng arrayMove tương tự như kéo thả column
        const dndOrderedCards = arrayMove(oldColumWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        const dndOrderedCardsIds = dndOrderedCards.map(card => card._id)

        // Cập nhật lại state sau khi hành động tránh delay khi gọi API
        setorderedColumnState(prevColumns => {

          // Đoạn này cài gói loDash, mục đích là clone mảng orderedColumnState cũ ra một cái mới
          // để xử lý data rồi return, cập nhật lại orderedColumnState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới column mà chúng ta đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // Cập nhật lại 2 giá trị mới là card và cardOrderIds trong targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCardsIds

          return nextColumns
        })
        // Gọi hàm moveCards nằm ở component cha cao nhất (board/_id.jsx)
        moveCards(dndOrderedCards, dndOrderedCardsIds, oldColumWhenDraggingCard._id)
      }
    }

    // Nếu kéo column thì chạy
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // console.log('Đang kéo column')
      if (active.id !== over.id) {
        // Lấy vị trí cũ của active
        const oldColumnIndex = orderedColumnState.findIndex(c => c._id == active.id)
        // Lấy vị trí mới của over
        const newColumnIndex = orderedColumnState.findIndex(c => c._id == over.id)

        // Dùng arrayMove của dnd-Kit để sắp xếp lại mảng Col ban đầu
        // Code của arrayMove git của dnd-Kit: dnd-Kit/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumnState = arrayMove(orderedColumnState, oldColumnIndex, newColumnIndex)

        // Cập nhật lại state sau khi hành động tránh delay khi gọi API
        setorderedColumnState(dndOrderedColumnState)

        // Gọi hàm moveColumns nằm ở component cha cao nhất (board/_id.jsx)
        moveColumns(dndOrderedColumnState)
      }
    }

    // Reset lại giá trị của các state để clear dữ liệu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setoldColumWhenDraggingCard(null)
  }

  // console.log('activeDragItemId', activeDragItemId)
  // console.log('activeDragItemType', activeDragItemType)
  // console.log('activeDragItemData', activeDragItemData)

  const styleDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } } })
  }

  // Custom cho thuật toán phát hiện va chạm tối ưu việc kéo thả giữa nhiều column
  const collisionDetectionStrategy = useCallback((args) => {
    // Nếu đang kéo column thì sử dụng thuật toán phát hiện va chạm mặc định (closestCorners)
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }
    // Tìm các điểm va chạm giữa pointer và các phần tử
    const pointerIntersections = pointerWithin(args)
    // console.log('pointerIntersections', pointerIntersections)

    // Dòng này là fix lỗi khi kéo 1 card ra ngoài vùng kéo thả
    if (!pointerIntersections?.length) return

    // // Phát hiện va chạm và trả về một mảng các phần tử va chạm, vì đã return ở trên nên không cần dòng này
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)

    // Tìm overId là phần tử đầu tiên trong intersections va chạm
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      const overColumn = orderedColumnState.find(column => column._id === overId)
      // Nếu over là column thì tìm tới cardId gần nhất bên trong khu vực va chạm,
      // dựa và thuật toán closestCorners.
      if (overColumn) {
        // console.log('overIdBefore', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (overColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
      }
      // console.log('overIdAfter', overId)
      lastOverId.current = overId
      return [{ id: overId }]
    }

    // Nếu không tìm thấy phần tử nào va chạm thì trả về mảng rỗng
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumnState])

  return (
    <DndContext
      sensors={Sensor}
      // Sử dụng thuật toán phát hiện va chạm
      // Có trong doc https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms

      // Thuật toán mặc định, nhưng bị lỗi khi kéo thả card giữa các column
      // collisionDetection={closestCorners}

      // Custom cho thuật toán phát hiện va chạm
      collisionDetection={collisionDetectionStrategy}

      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'light' ? '#BABCA7' : '#4C4A45'),
        width: '100%',
        height: (theme) => theme.casani.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={ orderedColumnState } />
        <DragOverlay dropAnimation={styleDropAnimation}>

          {
            // Nếu giá trị activeDragItemType ban đầu là null thì không làm gì
            (!activeDragItemType) && null
          }

          {
            // Nếu activeDragItemType là column thì sẽ render 1 column để giữ chỗ
            // và truyền dữ liệu cho Column
            (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {
            (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />
          }
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent