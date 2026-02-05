
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { EventRequest } from '../types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/he';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../src/Calendar.css';

moment.locale('he');
const localizer = momentLocalizer(moment);

const statusTranslations: { [key: string]: string } = {
  new: "פנייה חדשה",
  quote_sent: "נשלחה הצעת מחיר",
  deposit_paid: "שולם מקדמה",
  completed: "בוצע",
  archived: "ארכיון"
};

const Column = ({ col, items }: { col: { name: string; items: EventRequest[] }; items: EventRequest[] }) => {
    return (
        <div className="flex-1 p-2">
            <h3 className="font-bold text-lg mb-2">{col.name}</h3>
            <div className="bg-gray-100 p-2 rounded-lg min-h-[200px]">
                {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-3 mb-2 rounded shadow"
                            >
                                <p>{item.customerName}</p>
                            </div>
                        )}
                    </Draggable>
                ))}
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const [viewMode, setViewMode] = useState('board'); // Default to board view
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState({
        new: { name: "פנייה חדשה", items: [] },
        quote_sent: { name: "נשלחה הצעת מחיר", items: [] },
        deposit_paid: { name: "שולם מקדמה", items: [] },
        completed: { name: "בוצע", items: [] },
        archived: { name: "ארכיון", items: [] }
    });
    const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, data: any[] }>({ isOpen: false, data: [] });


    useEffect(() => {
        loadRequests();
        document.body.style.backgroundColor = '#f8fafc'; // slate-50
        return () => { document.body.style.backgroundColor = '' };
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('event_requests').select('*');
        
        if (error) {
            console.error("Error loading requests:", error);
        } else {
            const newColumns = {
                new: { name: "פנייה חדשה", items: [] },
                quote_sent: { name: "נשלחה הצעת מחיר", items: [] },
                deposit_paid: { name: "שולם מקדמה", items: [] },
                completed: { name: "בוצע", items: [] },
                archived: { name: "ארכיון", items: [] }
            };

            data.forEach((req: EventRequest) => {
                if (newColumns[req.status]) {
                    newColumns[req.status].items.push(req);
                }
            });
            
            setColumns(newColumns);
        }
        setLoading(false);
    };

    const onDragEnd = async (result: any) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        // Optimistic UI update
        const sourceCol = columns[source.droppableId];
        const destCol = columns[destination.droppableId];
        const sourceItems = [...sourceCol.items];
        const destItems = [...destCol.items];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);

        setColumns({
            ...columns,
            [source.droppableId]: { ...sourceCol, items: sourceItems },
            [destination.droppableId]: { ...destCol, items: destItems }
        });

        // Update Supabase
        const newStatus = destination.droppableId;
        const updateData: { status: string; quote_sent_at?: string } = { status: newStatus };

        if (newStatus === 'quote_sent') {
            updateData.quote_sent_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('event_requests')
            .update(updateData)
            .eq('id', draggableId);

        if (error) {
            alert("שגיאה בעדכון השרת!");
            // Revert optimistic update if server update fails
            loadRequests();
        }
    };
    
    const checkUrgency = (status, quoteDate) => {
        if (status !== 'quote_sent' || !quoteDate) return false;
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        return (new Date().getTime() - new Date(quoteDate).getTime()) > threeDaysInMs;
    };

    const openHistory = async (email) => {
        const { data } = await supabase
            .from('event_requests')
            .select('event_date, event_type, status')
            .ilike('email', email)
            .order('event_date', { ascending: false });

        setHistoryModal({ isOpen: true, data: data || [] });
    };


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-serif font-bold text-slate-900">ניהול אירועים</h1>
                <div className="flex items-center gap-2 p-1 rounded-full bg-slate-200/80">
                    <button onClick={() => setViewMode('board')} className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 rounded-full transition-all ${viewMode === 'board' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>
                        <i className='bx bxs-layout'></i> לוח
                    </button>
                    <button onClick={() => setViewMode('calendar')} className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 rounded-full transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>
                        <i className='bx bxs-calendar'></i> יומן
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-neutral-500">טוען נתונים...</div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-1 sm:p-2">
                    {viewMode === 'board' ? (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex overflow-x-auto">
                                {Object.entries(columns).map(([id, col]) => (
                                    <Droppable key={id} droppableId={id}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-1 p-2"
                                            >
                                                <h3 className="font-bold text-lg mb-2">{col.name}</h3>
                                                <div className="bg-gray-100 p-2 rounded-lg min-h-[200px]">
                                                    {col.items.map((item, index) => {
                                                        const isUrgent = checkUrgency(item.status, item.quote_sent_at);
                                                        return (
                                                            <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={`p-4 mb-2 rounded shadow ${isUrgent ? 'border-2 border-red-600 bg-red-50' : 'bg-white'}`}
                                                                    >
                                                                        <h4 className="font-bold">{item.customerName}</h4>
                                                                        <p className="text-sm">{item.event_type}</p>
                                                                        <p className="text-sm">{new Date(item.eventDate).toLocaleDateString('he-IL')}</p>
                                                                        {isUrgent && <p className="text-red-600 text-xs animate-bounce font-bold">⚠️ לא ענה כבר 3 ימים!</p>}
                                                                        <button onClick={() => openHistory(item.email)} className="text-blue-500 hover:underline mt-2">היסטוריית לקוח</button>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    })}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                ))}
                            </div>
                        </DragDropContext>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={[]} // Replace with calendar events
                            startAccessor="start"
                            endAccessor="end"
                            // ... other calendar props
                        />
                    )}
                </div>
            )}
            
            {historyModal.isOpen && (
                <div onClick={() => setHistoryModal({ isOpen: false, data: [] })} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-opacity">
                    <div onClick={e => e.stopPropagation()} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-right transform transition-all">
                        <h2 className="text-2xl font-bold mb-4">היסטוריית לקוח</h2>
                        <table className="w-full text-right">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">תאריך אירוע</th>
                                    <th className="px-4 py-2">סוג אירוע</th>
                                    <th className="px-4 py-2">סטטוס</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyModal.data.map((event, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{new Date(event.event_date).toLocaleDateString('he-IL')}</td>
                                        <td className="border px-4 py-2">{event.event_type}</td>
                                        <td className="border px-4 py-2">{statusTranslations[event.status] || event.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setHistoryModal({ isOpen: false, data: [] })} className="mt-4 px-4 py-2 bg-gray-200 rounded">סגור</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
