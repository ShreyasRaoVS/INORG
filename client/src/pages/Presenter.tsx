import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Presentation, Download } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  content: string;
  background: string;
}

export default function Presenter() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, title: 'Welcome', content: 'Click to edit this slide', background: 'bg-gradient-to-br from-blue-500 to-purple-600' },
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      title: 'New Slide',
      content: 'Click to edit',
      background: 'bg-gradient-to-br from-slate-500 to-slate-700',
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = (index: number) => {
    if (slides.length === 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    }
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (isPresenting) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center relative">
        <div className={`w-full h-full flex flex-col items-center justify-center text-white p-16 ${slides[currentSlide].background}`}>
          <h1 className="text-6xl font-bold mb-8 text-center">{slides[currentSlide].title}</h1>
          <p className="text-3xl text-center max-w-4xl">{slides[currentSlide].content}</p>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-lg rounded-full px-6 py-3">
          <button onClick={prevSlide} disabled={currentSlide === 0} className="text-white p-2 hover:bg-white/20 rounded-full transition disabled:opacity-50">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-white font-medium">{currentSlide + 1} / {slides.length}</span>
          <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="text-white p-2 hover:bg-white/20 rounded-full transition disabled:opacity-50">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          <button onClick={() => setIsPresenting(false)} className="text-white px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full transition">
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <button onClick={addSlide} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mb-4">
          <Plus className="w-5 h-5" />
          Add Slide
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              className={`relative p-3 rounded-lg cursor-pointer transition ${
                currentSlide === index ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className={`h-32 rounded ${slide.background} flex items-center justify-center mb-2`}>
                <span className="text-white text-sm font-semibold">{slide.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Slide {index + 1}</span>
                {slides.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} className="p-1 hover:bg-red-100 text-red-600 rounded transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Slide {currentSlide + 1} of {slides.length}</h2>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={() => setIsPresenting(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <Presentation className="w-4 h-4" />
              Present
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          <div className={`max-w-5xl mx-auto aspect-video ${slides[currentSlide].background} rounded-lg shadow-2xl p-12 flex flex-col justify-center`}>
            <input
              type="text"
              value={slides[currentSlide].title}
              onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
              className="text-5xl font-bold text-white bg-transparent border-none outline-none mb-8 text-center placeholder-white/50"
              placeholder="Slide Title"
            />
            <textarea
              value={slides[currentSlide].content}
              onChange={(e) => updateSlide(currentSlide, 'content', e.target.value)}
              className="text-2xl text-white bg-transparent border-none outline-none resize-none text-center placeholder-white/50"
              placeholder="Slide content..."
              rows={4}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <label className="text-sm font-medium text-slate-700">Background:</label>
            {['bg-gradient-to-br from-blue-500 to-purple-600', 'bg-gradient-to-br from-green-500 to-teal-600', 'bg-gradient-to-br from-orange-500 to-red-600', 'bg-gradient-to-br from-slate-700 to-slate-900'].map((bg) => (
              <button
                key={bg}
                onClick={() => updateSlide(currentSlide, 'background', bg)}
                className={`w-12 h-12 ${bg} rounded-lg border-2 ${slides[currentSlide].background === bg ? 'border-blue-600 scale-110' : 'border-transparent'} transition hover:scale-110`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
