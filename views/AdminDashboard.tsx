
import React, { useState, useEffect, useMemo } from 'react';
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
  archived: "ארכיון",
  confirmed: "מאושר", // Added from original
  pending: "ממתין לאישור" // Added from original
};

const statusStyles: { [key: string]: string } = {
  new: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  quote_sent: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  deposit_paid: 'bg-purple-100 text-purple-800 ring-purple-600/20',
  completed: 'bg-green-100 text-green-800 ring-green-600/20',
  archived: 'bg-gray-100 text-gray-800 ring-gray-600/20',
  pending: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  confirmed: 'bg-green-100 text-green-800 ring-green-600/20',
};


const AdminDashboard: React.FC = () => {
    const [viewMode, setViewMode] = useState('board');
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<EventRequest[]>([]); // Data for calendar
    const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null); // For modal
    const [columns, setColumns] = useState({
        new: { name: "פנייה חדשה", items: [] },
        quote_sent: { name: "נשלחה הצעת מחיר", items: [] },
        deposit_paid: { name: "שולם מקדמה", items: [] },
        confirmed: { name: "מאושר", items: [] },
        completed: { name: "בוצע", items: [] },
        archived: { name: "ארכיון", items: [] },
        pending: { name: "ממתין לאישור", items: [] }
    });
    const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, data: any[] }>({ isOpen: false, data: [] });


    useEffect(() => {
        loadRequests();
        document.body.style.backgroundColor = '#f8fafc';
        return () => { document.body.style.backgroundColor = '' };
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('event_requests').select('*');
        
        if (error) {
            console.error("Error loading requests:", error);
        } else {
            const allRequests = (data as EventRequest[]) || [];
            setRequests(allRequests);

            const newColumns: any = {
                new: { name: "פנייה חדשה", items: [] },
                quote_sent: { name: "נשלחה הצעת מחיר", items: [] },
                deposit_paid: { name: "שולם מקדמה", items: [] },
                confirmed: { name: "מאושר", items: [] },
                completed: { name: "בוצע", items: [] },
                archived: { name: "ארכיון", items: [] },
                pending: { name: "ממתין לאישור", items: [] }
            };

            allRequests.forEach((req) => {
                if (newColumns[req.status]) {
                    newColumns[req.status].items.push(req);
                } else {
                    console.warn(`Status ${req.status} not found in columns, moving to 'new'`);
                    newColumns['new'].items.push(req);
                }
            });
            
            setColumns(newColumns);
        }
        setLoading(false);
    };

    const onDragEnd = async (result: any) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const sourceColKey = source.droppableId;
        const destColKey = destination.droppableId;

        // Optimistic UI update
        const sourceCol = columns[sourceColKey];
        const destCol = columns[destColKey];
        const sourceItems = [...sourceCol.items];
        const destItems = destColKey === sourceColKey ? sourceItems : [...destCol.items];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);
        
        const newColumns = {
            ...columns,
            [sourceColKey]: { ...sourceCol, items: sourceItems },
            [destColKey]: { ...destCol, items: destItems },
        };
        setColumns(newColumns);
        
        // Also update the main \`requests\` array to keep calendar in sync
        const updatedRequests = requests.map(req => 
            req.id.toString() === draggableId 
                ? { ...req, status: destColKey }
                : req
        );
        setRequests(updatedRequests);


        // Update Supabase
        const newStatus = destination.droppableId;
        const updateData: { status: string; quote_sent_at?: string } = { status: newStatus };

        if (newStatus === 'quote_sent' && (!removed.quote_sent_at)) {
            updateData.quote_sent_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('event_requests')
            .update(updateData)
            .eq('id', draggableId);

        if (error) {
            alert("שגיאה בעדכון השרת!");
            loadRequests(); // Revert on failure
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

    const calendarEvents = useMemo(() => requests.map(req => ({
        title: \`\${req.customerName} - \${req.event_type}\`,
        start: new Date(req.eventDate),
        end: new Date(req.eventDate),
        resource: req,
    })), [requests]);

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-serif font-bold text-slate-900">ניהול אירועים</h1>
                <div className="flex items-center gap-2 p-1 rounded-full bg-slate-200/80">
                    <button onClick={() => setViewMode('board')} className={\`px-5 py-2.5 text-sm font-bold flex items-center gap-2 rounded-full transition-all \${viewMode === 'board' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}\`}>
                        <i className='bx bxs-layout'></i> לוח
                    </button>
                    <button onClick={() => setViewMode('calendar')} className={\`px-5 py-2.5 text-sm font-bold flex items-center gap-2 rounded-full transition-all \${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}\`}>
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
                            <div className="flex overflow-x-auto p-2">
                                {Object.entries(columns).map(([id, col]) => (
                                    <Droppable key={id} droppableId={id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-1 min-w-[300px] p-2 mx-1 rounded-xl transition-colors bg-slate-100/60"
                                            >
                                                <h3 className="font-bold text-lg mb-4 px-2 text-slate-700">{col.name} <span className="text-slate-400 font-normal text-sm">({col.items.length})</span></h3>
                                                <div className="min-h-[60vh]">
                                                    {col.items.map((item, index) => {
                                                        const isUrgent = checkUrgency(item.status, item.quote_sent_at);
                                                        return (
                                                            <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={\`p-4 mb-3 rounded-lg shadow-sm transition-shadow \${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'} \${isUrgent ? 'border-2 border-red-500 bg-red-50/50' : 'bg-white'}\`}
                                                                    >
                                                                        <h4 className="font-bold text-slate-800">{item.customerName}</h4>
                                                                        <p className="text-sm text-slate-600">{item.event_type}</p>
                                                                        <p className="text-sm text-slate-500">{new Date(item.eventDate).toLocaleDateString('he-IL')}</p>
                                                                        {isUrgent && <p className="text-red-600 text-xs animate-bounce font-bold pt-2">⚠️ לא ענה כבר 3 ימים!</p>}
                                                                        <button onClick={() => openHistory(item.email)} className="text-blue-600 hover:underline mt-3 text-sm font-semibold">היסטוריית לקוח</button>
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
                            events={calendarEvents}
                            onSelectEvent={(event: any) => setSelectedEvent(event.resource)}
                            startAccessor="start"
                            endAccessor="end"
                            eventPropGetter={(event: any) => {
                                const statusClass = \`status-\${event.resource.status}\`;
                                return { className: statusClass };
                            }}
                            messages={{
                                next: "הבא", previous: "הקודם", today: "היום", month: "חודש", week: "שבוע", day: "יום", agenda: "אג'נדה", date: "תאריך", time: "שעה", event: "אירוע", noEventsInRange: "אין אירועים בטווח זה.", showMore: total => \`+\${total}\`
                            }}
                        />
                    )}
                </div>
            )}
            
            {historyModal.isOpen && (
                <div onClick={() => setHistoryModal({ isOpen: false, data: [] })} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div onClick={e => e.stopPropagation()} className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-right">
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">היסטוריית לקוח</h2>
                        <div className="overflow-y-auto max-h-[60vh]">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="p-3 text-sm font-bold text-slate-600 text-right border-b">תאריך אירוע</th>
                                        <th className="p-3 text-sm font-bold text-slate-600 text-right border-b">סוג אירוע</th>
                                        <th className="p-3 text-sm font-bold text-slate-600 text-right border-b">סטטוס</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyModal.data.map((event, index) => (
                                        <tr key={index} className="hover:bg-slate-50/70">
                                            <td className="p-3 border-b border-slate-100">{new Date(event.event_date).toLocaleDateString('he-IL')}</td>
                                            <td className="p-3 border-b border-slate-100">{event.event_type}</td>
                                            <td className="p-3 border-b border-slate-100">
                                                <span className={\`px-3 py-1.5 text-xs font-bold rounded-full ring-1 ring-inset \${statusStyles[event.status] || 'bg-gray-100 text-gray-800'}\`}>
                                                    {statusTranslations[event.status] || event.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setHistoryModal({ isOpen: false, data: [] })} className="mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">סגור</button>
                    </div>
                </div>
            )}

            {selectedEvent && (
                 <div onClick={() => setSelectedEvent(null)} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-opacity">
                    <div onClick={e => e.stopPropagation()} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-right transform transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-1 text-slate-800">{selectedEvent.customerName}</h2>
                                <p className="text-slate-500">{selectedEvent.location}</p>
                            </div>
                            <span className={\`px-3 py-1.5 text-xs font-bold rounded-full ring-1 ring-inset \${statusStyles[selectedEvent.status]}\`}>
                                {statusTranslations[selectedEvent.status]}
                            </span>
                        </div>
                        <div className="my-6 border-t border-slate-100"></div>
                        <div className="space-y-4 text-sm">
                            <p><strong>תאריך:</strong> {new Date(selectedEvent.eventDate).toLocaleDateString('he-IL')}</p>
                            <p><strong>מספר אורחים:</strong> {selectedEvent.guestCount}</p>
                            <p><strong>אימייל:</strong> {selectedEvent.email}</p>
                            <p><strong>טלפון:</strong> {selectedEvent.phone}</p>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setSelectedEvent(null)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">סגור</button>
                        </div>
                   </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
