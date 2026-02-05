import{s as o}from"./supabase-DQV9IvfH.js";async function l(){const{data:a,error:e}=await o.from("event_requests").select("*").order("event_date",{ascending:!0});if(e){document.getElementById("loader").innerHTML="שגיאה בטעינה: "+e.message;return}const d=document.getElementById("table-body");document.getElementById("loader").style.display="none",document.getElementById("events-table").style.display="table",a.forEach(t=>{const s=document.createElement("tr"),n=t.status==="pending"?"status-pending":"status-approved";s.innerHTML=`
                <td><strong>${t.customer_name}</strong><br><small>${t.email}</small></td>
                <td>${new Date(t.event_date).toLocaleDateString("he-IL")}</td>
                <td>${t.location}</td>
                <td>${t.guest_count}</td>
                <td><span class="status-badge ${n}">${t.status||"חדש"}</span></td>
                <td>${t.selected_menu_id||"-"}</td>
            `,d.appendChild(s)})}l();
