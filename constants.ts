
import { MenuTemplate, Testimonial } from './types';

export const MENUS: MenuTemplate[] = [
  {
    id: 'classic',
    name: 'תפריט קלאסי',
    categories: [
      {
        id: 'salads',
        title: 'סלטים (בחרו 6)',
        limit: 6,
        items: [
          { id: 's1', name: 'חומוס ביתי', description: 'עם שמן זית וכמון', image: 'https://picsum.photos/seed/s1/400/300' },
          { id: 's2', name: 'טחינה ירוקה', description: 'שפע פטרוזיליה ולימון', image: 'https://picsum.photos/seed/s2/400/300' },
          { id: 's3', name: 'מטבוחה מרוקאית', description: 'בישול ארוך של עגבניות ופלפלים', image: 'https://picsum.photos/seed/s3/400/300' },
          { id: 's4', name: 'כרוב סגול במיונז', description: 'מרקם קטיפתי ועשיר', image: 'https://picsum.photos/seed/s4/400/300' },
          { id: 's5', name: 'סלט גזר מרוקאי', description: 'פיקנטי עם לימון כבוש', image: 'https://picsum.photos/seed/s5/400/300' },
          { id: 's6', name: 'חציל בטעם כבד', description: 'מעדן נוסטלגי', image: 'https://picsum.photos/seed/s6/400/300' },
          { id: 's7', name: 'סלט סלק אדום', description: 'בתיבול כמון ופטרוזיליה', image: 'https://picsum.photos/seed/s7/400/300' },
          { id: 's8', name: 'סלט פסטה קר', description: 'עם ירקות קלויים', image: 'https://picsum.photos/seed/s8/400/300' },
        ]
      },
      {
        id: 'mains',
        title: 'מנות עיקריות (בחרו 2)',
        limit: 2,
        items: [
          { id: 'm1', name: 'צלי כתף ביין', description: 'בבישול ארוך עם ירקות שורש', image: 'https://picsum.photos/seed/m1/400/300' },
          { id: 'm2', name: 'פרגיות במרינדה', description: 'על הגריל עם עשבי תיבול', image: 'https://picsum.photos/seed/m2/400/300' },
          { id: 'm3', name: 'שניצל ביתי', description: 'בציפוי פריך וזהוב', image: 'https://picsum.photos/seed/m3/400/300' },
          { id: 'm4', name: 'קציצות בקר ברוטב', description: 'ברוטב עגבניות עשיר', image: 'https://picsum.photos/seed/m4/400/300' },
        ]
      },
      {
        id: 'sides',
        title: 'תוספות (בחרו 2)',
        limit: 2,
        items: [
          { id: 'si1', name: 'אורז עם שקדים', description: 'אורז בסמטי מבושם', image: 'https://picsum.photos/seed/si1/400/300' },
          { id: 'si2', name: 'תפוחי אדמה אפויים', description: 'עם רוזמרין ושום', image: 'https://picsum.photos/seed/si2/400/300' },
          { id: 'si3', name: 'ירקות מוקפצים', description: 'שפע ירקות העונה', image: 'https://picsum.photos/seed/si3/400/300' },
        ]
      }
    ]
  },
  {
    id: 'extra',
    name: 'תפריט אקסטרה',
    categories: [
      {
        id: 'salads',
        title: 'סלטים (בחרו 8)',
        limit: 8,
        items: [
          { id: 's1', name: 'חומוס פרימיום', description: 'עם גרגרים חמים', image: 'https://picsum.photos/seed/s1/400/300' },
          { id: 's2', name: 'טחינה צבעונית', description: 'שלושה סוגי טחינה', image: 'https://picsum.photos/seed/s2/400/300' },
          { id: 's3', name: 'מטבוחה של אמא', description: 'מתכון סודי', image: 'https://picsum.photos/seed/s3/400/300' },
          { id: 's4', name: 'כרוב אסייתי', description: 'עם שומשום ובוטנים', image: 'https://picsum.photos/seed/s4/400/300' },
          { id: 's5', name: 'חציל בלאדי', description: 'על האש עם טחינה גולמית', image: 'https://picsum.photos/seed/s5/400/300' },
          { id: 's6', name: 'סלט קפרזה', description: 'עגבניות שרי ובזיליקום', image: 'https://picsum.photos/seed/s6/400/300' },
          { id: 's7', name: 'סלט פומלה ורימון', description: 'מרענן ומפתיע', image: 'https://picsum.photos/seed/s7/400/300' },
          { id: 's8', name: 'סלט שורשים', description: 'גפרורי ירקות ורטב ויניגרט', image: 'https://picsum.photos/seed/s8/400/300' },
          { id: 's9', name: 'טאבולה לבנוני', description: 'שפע ירק ובורגול דק', image: 'https://picsum.photos/seed/s9/400/300' },
          { id: 's10', name: 'סלט ביצים ביתי', description: 'עם בצל מטוגן', image: 'https://picsum.photos/seed/s10/400/300' },
        ]
      },
      {
        id: 'mains',
        title: 'מנות עיקריות (בחרו 3)',
        limit: 3,
        items: [
          { id: 'm1', name: 'אסאדו בבישול איטי', description: 'נמס בפה ברוטב ברביקיו', image: 'https://picsum.photos/seed/m1/400/300' },
          { id: 'm2', name: 'פילה סלמון בתנור', description: 'בעשבי תיבול ולימון', image: 'https://picsum.photos/seed/m2/400/300' },
          { id: 'm3', name: 'קבב כבש', description: 'מתובל היטב על הגריל', image: 'https://picsum.photos/seed/m3/400/300' },
          { id: 'm4', name: 'עוף ממולא', description: 'באורז ובשר טחון', image: 'https://picsum.photos/seed/m4/400/300' },
        ]
      }
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  { id: 't1', name: 'משפחת כהן', text: 'האוכל היה פשוט מושלם! כל האורחים לא הפסיקו לשבח את הטעמים וההגשה.', rating: 5 },
  { id: 't2', name: 'רחל לוי', text: 'שירות מקצועי מא׳ ועד ת׳. תודה רבה על אירוע בלתי נשכח!', rating: 5 },
  { id: 't3', name: 'יוסי ודנה', text: 'התפריט היה עשיר ומגוון, והכל הגיע חם וטרי. מומלץ בחום!', rating: 5 },
];
