import React from 'react'

const colors = [
  { name: 'Background', sub: 'Curd / Yogurt White', hex: '#FFF8E7', text: '#4A2E20' },
  { name: 'Heading & Button', sub: 'Yellowish Gold', hex: '#E0A526', text: '#FFFFFF' },
  { name: 'Button Hover', sub: 'Darker Yellow', hex: '#C78E1E', text: '#FFFFFF' },
  { name: 'Body Text', sub: 'Dark Brown', hex: '#4A2E20', text: '#FFF8E7' },
  { name: 'Card Background', sub: 'Soft Cream', hex: '#F5EFE1', text: '#4A2E20' },
  { name: 'Borders', sub: 'Light Tan', hex: '#E8DCC4', text: '#4A2E20' },
  { name: 'Muted Text', sub: 'Warm Grey-Brown', hex: '#8A7A6B', text: '#FFFFFF' },
]

const dishes = [
  {
    name: 'Butter Chicken',
    desc: 'Slow-simmered tomato and cashew gravy, tandoor chicken, a spoon of cream at the end.',
    price: '৳420',
    tag: 'Chef\'s pick',
  },
  {
    name: 'Kachi Biryani',
    desc: 'Basmati and mutton sealed and cooked together in the old dum style, saffron and fried onion.',
    price: '৳480',
    tag: 'Best seller',
  },
  {
    name: 'Bhapa Ilish',
    desc: 'Hilsa steamed in mustard and coconut, wrapped in banana leaf.',
    price: '৳650',
    tag: 'Seasonal',
  },
]

const Example = () => {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: '#FFF8E7', color: '#4A2E20' }}
      className="min-h-screen w-full"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600&display=swap');
        .mt-heading { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 md:px-16" style={{ borderBottom: '1px solid #E8DCC4' }}>
        <span className="mt-heading text-xl font-bold" style={{ color: '#E0A526' }}>
          Master Table
        </span>
        <nav className="hidden gap-8 text-sm font-medium md:flex" style={{ color: '#4A2E20' }}>
          <span>Menu</span>
          <span>Reservations</span>
          <span>Story</span>
        </nav>
        <button
          className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-shadow"
          style={{ backgroundColor: '#E0A526', color: '#FFFFFF' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C78E1E')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E0A526')}
        >
          Reserve a table
        </button>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="mt-heading font-bold" style={{ color: '#E0A526', fontSize: '52px', lineHeight: 1.2 }}>
            Food cooked the way your grandmother remembers it
          </h1>
          <p className="mt-5" style={{ fontSize: '16px', lineHeight: 1.6, color: '#4A2E20' }}>
            A neighbourhood table for slow-cooked curries, clay-oven bread, and rice dishes
            that take a full day to get right. No shortcuts, no substitutes.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <button
              className="rounded-lg px-7 py-3 text-[15px] font-semibold transition-shadow"
              style={{ backgroundColor: '#E0A526', color: '#FFFFFF' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#C78E1E'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(224,165,38,0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E0A526'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              View the menu
            </button>
            <button
              className="rounded-lg px-7 py-3 text-[15px] font-semibold"
              style={{ border: '1px solid #E8DCC4', color: '#4A2E20', backgroundColor: 'transparent' }}
            >
              Our story
            </button>
          </div>
        </div>
      </section>

      {/* Typography scale */}
      <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-16" style={{ borderTop: '1px solid #E8DCC4' }}>
        <h2 className="mt-heading font-semibold" style={{ color: '#E0A526', fontSize: '30px' }}>
          Typography
        </h2>
        <div className="mt-8 flex flex-col gap-6">
          <div>
            <p className="mt-heading font-bold" style={{ color: '#E0A526', fontSize: '48px', lineHeight: 1.2 }}>
              Aa Heading one
            </p>
            <p style={{ color: '#8A7A6B', fontSize: '13px' }}>Playfair Display · Bold 700 · 48–56px</p>
          </div>
          <div>
            <p className="mt-heading font-semibold" style={{ color: '#E0A526', fontSize: '28px' }}>
              Aa Heading two
            </p>
            <p style={{ color: '#8A7A6B', fontSize: '13px' }}>Playfair Display · SemiBold 600 · 28–32px</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#4A2E20', fontSize: '20px' }}>
              Aa Card title
            </p>
            <p style={{ color: '#8A7A6B', fontSize: '13px' }}>Poppins · SemiBold 600 · 18–22px</p>
          </div>
          <div>
            <p style={{ color: '#4A2E20', fontSize: '16px', lineHeight: 1.6 }}>
              This is body paragraph text, set in Poppins Regular at 15–16px with 1.6 line-height for comfortable reading.
            </p>
            <p style={{ color: '#8A7A6B', fontSize: '13px' }}>Poppins · Regular 400 · 15–16px</p>
          </div>
        </div>
      </section>

      {/* Color palette */}
      <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-16" style={{ borderTop: '1px solid #E8DCC4' }}>
        <h2 className="mt-heading font-semibold" style={{ color: '#E0A526', fontSize: '30px' }}>
          Color palette
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {colors.map((c) => (
            <div key={c.hex} className="overflow-hidden rounded-xl" style={{ border: '1px solid #E8DCC4' }}>
              <div className="flex h-20 items-end p-3" style={{ backgroundColor: c.hex, color: c.text }}>
                <span className="text-xs font-semibold">{c.hex}</span>
              </div>
              <div className="p-3" style={{ backgroundColor: '#F5EFE1' }}>
                <p className="text-sm font-semibold" style={{ color: '#4A2E20' }}>{c.name}</p>
                <p className="text-xs" style={{ color: '#8A7A6B' }}>{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dish cards */}
      <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-16" style={{ borderTop: '1px solid #E8DCC4' }}>
        <h2 className="mt-heading font-semibold" style={{ color: '#E0A526', fontSize: '30px' }}>
          From the menu
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {dishes.map((d) => (
            <div
              key={d.name}
              className="flex flex-col rounded-xl p-6"
              style={{ backgroundColor: '#F5EFE1', border: '1px solid #E8DCC4' }}
            >
              <span
                className="mb-3 w-fit rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: '#FFF8E7', color: '#8A7A6B', border: '1px solid #E8DCC4' }}
              >
                {d.tag}
              </span>
              <h3 className="font-semibold" style={{ color: '#4A2E20', fontSize: '20px' }}>
                {d.name}
              </h3>
              <p className="mt-2 flex-1" style={{ color: '#4A2E20', fontSize: '15px', lineHeight: 1.6 }}>
                {d.desc}
              </p>
              <p className="mt-4 font-medium" style={{ color: '#8A7A6B', fontSize: '14px' }}>
                {d.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center md:px-16"
        style={{ borderTop: '1px solid #E8DCC4', color: '#8A7A6B', fontSize: '14px' }}
      >
        Master Table — cooked slow, served warm.
      </footer>
    </div>
  )
}

export default Example