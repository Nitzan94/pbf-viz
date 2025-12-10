// ABOUTME: Help page with user guide in Hebrew
// ABOUTME: Simple markdown-style display for non-technical users

import Link from 'next/link';
import Image from 'next/image';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[var(--pbf-aqua-pale)] to-white">
      {/* Header */}
      <header className="border-b border-[var(--pbf-ocean)]/10 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/logo.png" alt="Pure Blue Fish" width={180} height={88} className="h-12 w-auto" />
            </Link>
            <div className="h-8 w-px bg-[var(--pbf-ocean)]/20" />
            <span className="text-lg font-medium text-[var(--pbf-navy)]">Help</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Studio
            </Link>
            <Link href="/blueprints" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Blueprints
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8" dir="rtl">
        <div className="glass-panel rounded-2xl p-8 space-y-8">

          <section>
            <h1 className="text-2xl font-bold text-[var(--pbf-navy)] mb-4">מדריך למשתמש</h1>
            <p className="text-[var(--pbf-navy)]/70">
              כלי ליצירת תמונות של המתקן באמצעות בינה מלאכותית.
              אתם מתארים מה אתם רוצים לראות - והמערכת יוצרת את התמונה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--pbf-ocean)] mb-3">התחלה מהירה</h2>

            <div className="space-y-4">
              <div className="bg-[var(--pbf-aqua-light)] rounded-xl p-4">
                <h3 className="font-medium text-[var(--pbf-navy)] mb-2">שלב 1: הכנסת מפתח API</h3>
                <p className="text-sm text-[var(--pbf-navy)]/70">
                  בפינה הימנית העליונה יש שדה &quot;Gemini API Key&quot;.
                  הדביקו שם את המפתח שקיבלתם.
                  אין לכם מפתח? לחצו על &quot;Get Key&quot;.
                </p>
              </div>

              <div className="bg-[var(--pbf-aqua-light)] rounded-xl p-4">
                <h3 className="font-medium text-[var(--pbf-navy)] mb-2">שלב 2: כתבו מה אתם רוצים</h3>
                <p className="text-sm text-[var(--pbf-navy)]/70 mb-2">
                  בתיבת הטקסט למטה, כתבו בעברית מה אתם רוצים לראות.
                </p>
                <p className="text-sm text-[var(--pbf-navy)]/60 italic">
                  דוגמאות: &quot;מבט מהאוויר בשקיעה&quot;, &quot;פנים המבנה עם העובדים&quot;, &quot;תחנת הקרנטינה&quot;
                </p>
              </div>

              <div className="bg-[var(--pbf-aqua-light)] rounded-xl p-4">
                <h3 className="font-medium text-[var(--pbf-navy)] mb-2">שלב 3: לחצו Send</h3>
                <p className="text-sm text-[var(--pbf-navy)]/70">
                  המערכת תכתוב פרומפט מקצועי.
                  כשתראו תיבה ירוקה עם &quot;Generated Prompt&quot; - לחצו על <strong>Generate Image</strong>.
                </p>
              </div>

              <div className="bg-[var(--pbf-aqua-light)] rounded-xl p-4">
                <h3 className="font-medium text-[var(--pbf-navy)] mb-2">שלב 4: המתינו</h3>
                <p className="text-sm text-[var(--pbf-navy)]/70">
                  יצירת תמונה לוקחת 10-30 שניות. התמונה תופיע בצד ימין.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--pbf-ocean)] mb-3">שני מצבי עבודה</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-[var(--pbf-turquoise)]/30 rounded-xl p-4">
                <h3 className="font-medium text-[var(--pbf-turquoise)] mb-2">Chat with AI (מומלץ)</h3>
                <p className="text-sm text-[var(--pbf-navy)]/70">
                  מדברים עם הבינה המלאכותית בעברית.
                  היא שואלת שאלות אם צריך ויוצרת פרומפט מקצועי.
                </p>
              </div>

              <div className="border border-[var(--pbf-ocean)]/20 rounded-xl p-4">
                <h3 className="font-medium text-[var(--pbf-navy)] mb-2">Direct Prompt</h3>
                <p className="text-sm text-[var(--pbf-navy)]/70">
                  כותבים ישירות באנגלית.
                  למשתמשים מנוסים שיודעים בדיוק מה הם רוצים.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--pbf-ocean)] mb-3">טיפים לתוצאות טובות</h2>

            <div className="space-y-2 text-sm text-[var(--pbf-navy)]/70">
              <p><strong>ציינו זווית צילום:</strong> &quot;מבט מהאוויר&quot;, &quot;מבט מבפנים&quot;, &quot;תקריב על המכלים&quot;</p>
              <p><strong>ציינו תאורה:</strong> &quot;בשקיעה&quot;, &quot;בצהריים&quot;, &quot;בלילה עם תאורה&quot;</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--pbf-ocean)] mb-3">Reference Image</h2>
            <p className="text-sm text-[var(--pbf-navy)]/70">
              אם יש לכם שרטוט שאתם רוצים שהמערכת תתבסס עליו - לחצו על <strong>Choose Blueprint</strong>.
              עמוד Blueprints מכיל שרטוטים מוכנים של המתקן.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--pbf-ocean)] mb-3">שיפור תמונה (Refine)</h2>
            <p className="text-sm text-[var(--pbf-navy)]/70">
              אחרי שנוצרה תמונה, לחצו על <strong>Refine</strong> וכתבו מה לשנות:
              &quot;תוסיף עובדים&quot;, &quot;תחליף לשקיעה&quot;, &quot;תסיר את העננים&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--pbf-ocean)] mb-3">הגדרות תמונה</h2>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-[var(--pbf-navy)] mb-1">Aspect Ratio</h3>
                <ul className="text-[var(--pbf-navy)]/70 space-y-1">
                  <li><strong>16:9</strong> - רחב, לפרזנטציות</li>
                  <li><strong>1:1</strong> - ריבוע, לאינסטגרם</li>
                  <li><strong>9:16</strong> - גבוה, לסטוריז</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-[var(--pbf-navy)] mb-1">Resolution</h3>
                <ul className="text-[var(--pbf-navy)]/70 space-y-1">
                  <li><strong>2K</strong> - ברירת מחדל</li>
                  <li><strong>4K</strong> - איכות מקסימלית (איטי יותר)</li>
                  <li><strong>1K</strong> - מהיר, לתצוגה מקדימה</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--pbf-ocean)] mb-3">פתרון בעיות</h2>

            <div className="space-y-3 text-sm">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h3 className="font-medium text-red-700 mb-1">&quot;Invalid API key&quot;</h3>
                <p className="text-red-600/70">ודאו שהמפתח הוכנס נכון (בלי רווחים מיותרים).</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-medium text-amber-700 mb-1">התמונה נטענת יותר מדי זמן</h3>
                <p className="text-amber-600/70">זה נורמלי, לפעמים לוקח עד 30 שניות. אם יותר מדקה - רעננו את הדף.</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-700 mb-1">שגיאה אדומה</h3>
                <p className="text-gray-600/70">רשמו את הטקסט של השגיאה ושלחו לניצן.</p>
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--pbf-ocean)]/10 pt-6">
            <p className="text-sm text-[var(--pbf-navy)]/50 text-center">
              שאלות? בעיות? דברו עם ניצן.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
