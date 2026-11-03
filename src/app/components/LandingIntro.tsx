import { useRef } from "react"
import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import metroMockup from "@/imports/landing/01-mockup-metro.jpg"
import edition from "@/imports/landing/02-edition-25.jpg"
import raveLegal from "@/imports/landing/03-rave-legal.jpg"
import attuned from "@/imports/landing/04-attuned.jpg"
import auBar from "@/imports/landing/05-au-bar.jpg"
import festivale from "@/imports/landing/06-festivale.jpg"
import metroPoster from "@/imports/landing/07-pub-metro.jpg"
import friche from "@/imports/landing/08-friche-6.jpg"
import graffeurs from "@/imports/landing/09-graffeurs.jpg"
import raleursB from "@/imports/landing/10-raleurs-b.png"

const introImages = [
  {
    src: metroMockup,
    alt: "Campagne graphique affichée dans le métro",
    width: "w-48 sm:w-60 md:w-72",
    background: "bg-muted",
  },
  {
    src: edition,
    alt: "Double page du projet éditorial Fixe le mouvement",
    width: "w-44 sm:w-56 md:w-64",
    background: "bg-muted",
  },
  {
    src: raveLegal,
    alt: "Affiches du projet Rave Legal",
    width: "w-44 sm:w-56 md:w-64",
    background: "bg-muted",
  },
  {
    src: attuned,
    alt: "Identité graphique du collectif Attuned",
    width: "w-48 sm:w-60 md:w-72",
    background: "bg-muted",
  },
  {
    src: auBar,
    alt: "Illustration Les Râleurs au bar",
    width: "w-32 sm:w-36 md:w-44",
    background: "bg-muted",
  },
  {
    src: festivale,
    alt: "Illustration jaune du Festivale",
    width: "w-32 sm:w-36 md:w-44",
    background: "bg-muted",
  },
  {
    src: metroPoster,
    alt: "Affiche Never Stop Exploring",
    width: "w-48 sm:w-60 md:w-72",
    background: "bg-muted",
  },
  {
    src: friche,
    alt: "Mise en page éditoriale du projet Friche",
    width: "w-44 sm:w-56 md:w-64",
    background: "bg-muted",
  },
  {
    src: graffeurs,
    alt: "Illustration verte Les Râleurs graffeurs",
    width: "w-36 sm:w-44 md:w-52",
    background: "bg-muted",
  },
  {
    src: raleursB,
    alt: "Les Râleurs",
    width: "w-48 sm:w-60 md:w-72",
    background: "bg-transparent",
  },
]

interface StackedImageProps {
  image: typeof introImages[number]
  index: number
  progress: MotionValue<number>
}

function StackedImage({ image, index, progress }: StackedImageProps) {
  const start = index * 0.075
  const opacity = useTransform(progress, (value) => (value >= start ? 1 : 0))

  return (
    <motion.div
      className={`absolute overflow-hidden shadow-2xl ${image.width} ${image.background}`}
      style={{
        opacity,
        zIndex: index + 1,
      }}
      data-cursor-card
    >
      <img
        src={image.src}
        alt={image.alt}
        className="block h-auto w-full"
        draggable={false}
      />
    </motion.div>
  )
}

interface LandingIntroProps {
  onComplete: () => void
}

export function LandingIntro({ onComplete }: LandingIntroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const hasCompleted = useRef(false)
  const reducedMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  const stackOpacity = useTransform(scrollYProgress, [0.76, 0.93], [1, 0])
  const stackScale = useTransform(scrollYProgress, [0.76, 0.93], [1, 0.92])

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (progress >= 0.92 && !hasCompleted.current) {
      hasCompleted.current = true
      onComplete()
    }
  })

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction aux illustrations"
      className="relative"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-background">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: reducedMotion ? 1 : stackOpacity,
            scale: reducedMotion ? 1 : stackScale,
          }}
        >
          {introImages.map((image, index) => (
            <StackedImage
              key={image.src}
              image={image}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </motion.div>
      </div>

      <div aria-hidden="true">
        {Array.from({ length: introImages.length - 1 }, (_, index) => (
          <div key={index} className="h-screen" />
        ))}
      </div>
    </section>
  )
}
