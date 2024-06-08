import React, { useState } from 'react';
import './App.css';
import { Calendar, Modal, Form, Input, Button, Tag } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function App() {
  const [value, setValue] = useState<Dayjs>(dayjs());
  const [mode, setMode] = useState<'month' | 'year'>('month');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [events, setEvents] = useState<{ [key: string]: { title: string; date: Dayjs; id: string }[] }>({});

  const onPanelChange = (newValue: Dayjs, newMode: 'month' | 'year') => {
    setValue(newValue);
    setMode(newMode);
  };

  const onDateDoubleClick = (date: Dayjs) => {
    setSelectedDate(date);
    setIsModalVisible(true);
  };

  const handleOk = (values: { title: string }) => {
    if (selectedDate) {
      const dateKey = selectedDate.format('YYYY-MM-DD');
      const newEvent = { title: values.title, date: selectedDate, id: Math.random().toString(36).substr(2, 9) };

      setEvents((prevEvents) => ({
        ...prevEvents,
        [dateKey]: prevEvents[dateKey] ? [...prevEvents[dateKey], newEvent] : [newEvent],
      }));
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleRemoveEvent = (dateKey: string, index: number) => {
    setEvents((prevEvents) => {
      const updatedEvents = [...prevEvents[dateKey]];
      updatedEvents.splice(index, 1);
      if (updatedEvents.length === 0) {
        const { [dateKey]: removed, ...rest } = prevEvents;
        return rest;
      }
      return { ...prevEvents, [dateKey]: updatedEvents };
    });
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceDateKey = source.droppableId;
    const destDateKey = destination.droppableId;

    if (sourceDateKey === destDateKey) {
      const items = Array.from(events[sourceDateKey]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setEvents((prevEvents) => ({
        ...prevEvents,
        [sourceDateKey]: items,
      }));
    } else {
      const sourceItems = Array.from(events[sourceDateKey]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      const destItems = Array.from(events[destDateKey] || []);
      destItems.splice(destination.index, 0, { ...movedItem, date: dayjs(destDateKey) });

      setEvents((prevEvents) => ({
        ...prevEvents,
        [sourceDateKey]: sourceItems,
        [destDateKey]: destItems,
      }));
    }
  };

  const dateCellRender = (date: Dayjs) => {
    const dateKey = date.format('YYYY-MM-DD');
    const dayEvents = events[dateKey] || [];

    return (
      <Droppable droppableId={dateKey} key={dateKey}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minHeight: '50px', padding: '8px' }}
            onDoubleClick={() => onDateDoubleClick(date)}
          >
            {dayEvents.map((event, index) => (
              <Draggable key={event.id} draggableId={event.id} index={index}>
                {(provided, snapshot) => (
                  <Tag
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    key={event.id}
                    color="blue"
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      handleRemoveEvent(dateKey, index);
                    }}
                    style={{
                      marginBottom: '4px',
                      cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                      ...provided.draggableProps.style,
                    }}
                  >
                    {event.title}
                  </Tag>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className="calendar-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <Calendar
          fullscreen={true}
          value={value}
          onPanelChange={onPanelChange}
          dateCellRender={dateCellRender}
          mode={mode}
        />
      </DragDropContext>
      <Modal
        title="Add Event"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form onFinish={handleOk}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Please input the event title!' }]}
          >
            <Input placeholder="Event Title" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Event
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
