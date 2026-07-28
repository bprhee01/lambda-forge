import type { World } from '../types'

/** Chapters 13–15 — Effects and I/O */
export const part4: World[] = [
  {
    id: 'ch13-io',
    chapter: 13,
    title: 'External Effects & I/O',
    subtitle: 'Push side effects to the edge with IO',
    theme: 'Describe the world; run it later.',
    overview:
      'Programs must talk to the outside world. The IO (or similar) type turns effects into values you can compose purely, delaying real I/O until an interpreter runs at the edge of main.',
    quests: [
      {
        id: 'c13-io-values',
        title: 'Effects as Values',
        blurb: 'IO[A] means a recipe for producing A.',
        xp: 75,
        lessons: [
          {
            heading: 'Separate program from running',
            body: [
              'An impure function that prints while computing mixes concerns. IO[A] is a description: “when run, perform effects and yield A.” Building IO values is pure; executing them is not.',
              'IO is typically a monad: flatMap sequences “do this, then use the result to choose the next effect.” That replaces nested callbacks with for-comprehensions.',
              'Keep most of your code as pure functions A => B. At the edges, assemble IO that calls those functions.',
            ],
            code: `// Conceptual IO (cats-effect / ZIO-style ideas)
trait IO[A] {
  def flatMap[B](f: A => IO[B]): IO[B]
  def map[B](f: A => B): IO[B]
}

def pure[A](a: A): IO[A] = ???
def delay[A](a: => A): IO[A] = ???  // suspend a side-effecting thunk

def putStrLn(s: String): IO[Unit] = delay(println(s))
def readLine: IO[String] = delay(scala.io.StdIn.readLine())

val greet: IO[Unit] =
  for {
    _    <- putStrLn("What is your name?")
    name <- readLine
    _    <- putStrLn(s"Hello, $name")
  } yield ()

// Only when the runtime runs greet do prints/reads happen.`,
            callout:
              'If you call println inside a “pure” helper, you have left the model. Wrap effects in IO/delay instead.',
          },
        ],
        challenges: [
          {
            id: 'c13-1',
            kind: 'multiple-choice',
            prompt: 'IO[A] is best thought of as…',
            choices: [
              'An A that already finished effects',
              'A description of a computation that may perform effects to produce A',
              'A slower Option',
              'Only for file handles',
            ],
            correctIndex: 1,
            explanation: 'Recipes compose; running happens at the edge.',
          },
          {
            id: 'c13-2',
            kind: 'true-false',
            prompt:
              'Constructing a for-comprehension of IO values performs the effects immediately.',
            correct: false,
            explanation:
              'Construction builds a description; effects run when interpreted.',
          },
          {
            id: 'c13-3',
            kind: 'fill-blank',
            prompt: 'Suspend a println.',
            template: 'def putStrLn(s: String): IO[Unit] = ___(println(s))',
            acceptedAnswers: ['delay', 'IO.delay', 'IO', 'IO.apply'],
            explanation: 'delay/IO(...) suspends the thunk.',
          },
          {
            id: 'c13-4',
            kind: 'spot-bug',
            prompt: 'Which line breaks the “effects as values” discipline?',
            lines: [
              'def loadConfig: IO[Config] = readFile("app.conf").map(parse)',
              'def boot: IO[Unit] = for {',
              '  cfg <- loadConfig',
              '  _    = println(cfg)  // eager side effect in pure position',
              '  _   <- runServer(cfg)',
              '} yield ()',
            ],
            buggyLine: 3,
            explanation:
              'The `= println` runs during flatMap setup. Use `_ <- putStrLn(cfg.toString)` instead.',
          },
        ],
      },
      {
        id: 'c13-stack',
        title: 'Interpreters & Stack',
        blurb: 'How IO can stay stack-safe and testable.',
        xp: 55,
        lessons: [
          {
            heading: 'Why an interpreter?',
            body: [
              'Representing IO as a data structure (or trampolined functions) lets you reinterpret programs: run for real, or mock effects in tests.',
              'Tail-recursive interpreters / trampolines avoid blowing the stack when chaining thousands of flatMaps.',
              'You do not need to build a full IO runtime here — remember the design: data + interpreter, effects at the rim.',
            ],
          },
        ],
        challenges: [
          {
            id: 'c13-5',
            kind: 'multiple-choice',
            prompt: 'A major benefit of IO-as-data is…',
            choices: [
              'Faster CPUs',
              'Alternative interpreters (test spies, different backends)',
              'Eliminating the need for types',
              'Making println total',
            ],
            correctIndex: 1,
            explanation: 'Same program, different runners.',
          },
          {
            id: 'c13-6',
            kind: 'true-false',
            prompt:
              'Trampolining helps keep deep flatMap chains from overflowing the stack.',
            correct: true,
            explanation: 'Turn recursion into a loop/heap-allocated steps.',
          },
          {
            id: 'c13-7',
            kind: 'multiple-choice',
            prompt: 'Where should most domain logic live?',
            choices: [
              'Inside every IO.delay thunk',
              'In pure functions called from IO at the edges',
              'Only in mutable objects',
              'In static initializers',
            ],
            correctIndex: 1,
            explanation: 'Pure core, effectful shell.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch14-local-effects',
    chapter: 14,
    title: 'Local Effects',
    subtitle: 'Mutable memory that never leaks out',
    theme: 'Bend metal in a sealed chamber.',
    overview:
      'Sometimes local mutation is the clearest algorithm. The ST (state thread) idea scopes mutation so it cannot escape — you get in-place updates with a pure exterior type.',
    quests: [
      {
        id: 'c14-st',
        title: 'Mutable but Contained',
        blurb: 'Use mutation locally without infecting callers.',
        xp: 70,
        lessons: [
          {
            heading: 'The escape hatch with a lock',
            body: [
              'Scala (and FP generally) allows mutation — but shared mutable state is what destroys reasoning.',
              'Local effects: allocate mutable memory, update it in a tight scope, then freeze/read out an immutable result. Callers never see the mutable cells.',
              'The ST monad (in the book’s lineage / Scalaz) uses a type parameter S like a “region capability” so mutable references cannot be returned to the outside world. You run ST and get a pure A.',
            ],
            code: `// Conceptual ST sketch
trait ST[S, A] {
  def map[B](f: A => B): ST[S, B]
  def flatMap[B](f: A => ST[S, B]): ST[S, B]
}

trait STRef[S, A] {
  def read: ST[S, A]
  def write(a: A): ST[S, Unit]
}

// run erases S — only programs that never leak STRef[S, _] can run
def run[A](st: (S => ST[S, A]) forSome { type S }): A = ???

// Practical Scala: keep mutation private inside a method
def inPlaceSort(xs: List[Int]): List[Int] = {
  val arr = xs.toArray
  scala.util.Sorting.quickSort(arr)  // local mutation
  arr.toList                         // immutable result escapes
}`,
            callout:
              'If a mutable reference can be observed after the scope ends, it is no longer “local.”',
          },
        ],
        challenges: [
          {
            id: 'c14-1',
            kind: 'multiple-choice',
            prompt: 'Local effects are acceptable in FP when…',
            choices: [
              'Any thread can mutate any var',
              'Mutation is confined and the exported result is immutable/pure',
              'You print from every helper',
              'You use null extensively',
            ],
            correctIndex: 1,
            explanation: 'Contain mutation; export purity.',
          },
          {
            id: 'c14-2',
            kind: 'true-false',
            prompt:
              'The ST type parameter S acts like a capability tagging that prevents leaking mutable refs.',
            correct: true,
            explanation: 'If S cannot escape, neither can STRef[S, A].',
          },
          {
            id: 'c14-3',
            kind: 'spot-bug',
            prompt: 'Which line leaks mutation to callers?',
            lines: [
              'def broken(xs: List[Int]): Array[Int] = {',
              '  val arr = xs.toArray',
              '  scala.util.Sorting.quickSort(arr)',
              '  arr  // caller can mutate later',
              '}',
            ],
            buggyLine: 3,
            explanation:
              'Returning Array lets callers mutate. Return List/Vector (immutable) instead.',
          },
          {
            id: 'c14-4',
            kind: 'fill-blank',
            prompt: 'Export an immutable copy.',
            template:
              'def sorted(xs: List[Int]): List[Int] = {\n  val arr = xs.toArray\n  scala.util.Sorting.quickSort(arr)\n  arr.___\n}',
            acceptedAnswers: ['toList', 'toVector', 'toSeq'],
            explanation: 'Convert to an immutable collection before returning.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch15-streaming',
    chapter: 15,
    title: 'Stream Processing',
    subtitle: 'Incremental I/O with composable stages',
    theme: 'Data flows through the forge in stages.',
    overview:
      'Loading entire files into memory does not scale. Stream processors / pipelines pull or push chunks through composable stages — mapping, filtering, decoding — with resource safety.',
    quests: [
      {
        id: 'c15-pipelines',
        title: 'Incremental Pipelines',
        blurb: 'Process data in chunks with composable transducers.',
        xp: 75,
        lessons: [
          {
            heading: 'Why streaming?',
            body: [
              'A program that reads a whole file into a String then splits lines can exhaust memory. Streaming keeps a working set small: pull a chunk, transform, emit, repeat.',
              'Functional stream libraries (the book’s Process/Stream ideas; today also fs2, Akka Streams, ZIO Stream) treat pipelines as values: map, filter, flatMap, zip, merge.',
              'Resource safety matters: open a file handle, process, and guarantee close — even on errors — via bracket/onComplete combinators.',
            ],
            code: `// Conceptual streaming stages
trait Process[I, O] {
  def map[O2](f: O => O2): Process[I, O2]
  def pipe[O2](p2: Process[O, O2]): Process[I, O2]
}

// Pipeline idea: bytes -> lines -> ints -> sum
// fileBytes
//   .through(utf8Decode)
//   .through(lines)
//   .map(_.toIntOption)
//   .collect { case Some(n) => n }
//   .fold(0)(_ + _)

// Effectful streams compose with IO
// Stream.bracket(openFile)(close)(...).compile.drain`,
            callout:
              'Compose many small stages instead of one function that does open+parse+aggregate+close.',
          },
        ],
        challenges: [
          {
            id: 'c15-1',
            kind: 'multiple-choice',
            prompt: 'Streaming I/O primarily helps you…',
            choices: [
              'Avoid types',
              'Process data incrementally without loading everything',
              'Make all algorithms O(1)',
              'Eliminate errors',
            ],
            correctIndex: 1,
            explanation: 'Bounded memory via chunked processing.',
          },
          {
            id: 'c15-2',
            kind: 'true-false',
            prompt:
              'Bracket/acquire-release patterns ensure resources close on failure.',
            correct: true,
            explanation: 'Resource safety is part of serious stream libraries.',
          },
          {
            id: 'c15-3',
            kind: 'multiple-choice',
            prompt: 'Pipelines as values enable…',
            choices: [
              'Only single-thread execution',
              'Composing, testing, and reusing stages',
              'Skipping effect systems',
              'Mutable global buffers as the only API',
            ],
            correctIndex: 1,
            explanation: 'Stages become library code you assemble.',
          },
          {
            id: 'c15-4',
            kind: 'fill-blank',
            prompt: 'Typical fold of ints in a stream mindset.',
            template: 'ints.fold(0)(_ ___ _)',
            acceptedAnswers: ['+'],
            explanation: 'Sum chunks incrementally with +.',
          },
          {
            id: 'c15-5',
            kind: 'spot-bug',
            prompt: 'Which approach fights streaming?',
            lines: [
              'def total(path: String): IO[Int] =',
              '  readAllBytes(path)',
              '    .map(bytes => new String(bytes))',
              '    .map(s => s.linesIterator.map(_.toInt).sum)',
              '// entire file materialized as one String',
            ],
            buggyLine: 1,
            explanation:
              'readAllBytes loads everything. Prefer chunked/line streaming.',
          },
        ],
      },
      {
        id: 'c15-capstone',
        title: 'Capstone: The FP Spine',
        blurb: 'Connect purity → algebra → effects.',
        xp: 50,
        lessons: [
          {
            heading: 'What you now own',
            body: [
              'You started with purity and ADTs, learned to handle errors as values, delay evaluation, and thread state explicitly.',
              'Then you saw libraries as algebras: parallelism, properties, parsers — designed with combinators and laws.',
              'Monoids, monads, and applicatives name the patterns you already used. IO and streaming show how real effects stay disciplined.',
              'Keep practicing: implement tiny versions of List folds, Option/Either, State, and a toy IO in a Scala worksheet. Read the Red Book next for proofs and deeper exercises — you already have the map.',
            ],
            callout:
              'Curriculum complete. Revisit any world on the map; XP and streaks track your forge time.',
          },
        ],
        challenges: [
          {
            id: 'c15-6',
            kind: 'multiple-choice',
            prompt: 'The “pure core / effectful shell” idea means…',
            choices: [
              'Never use IO',
              'Keep domain logic pure; isolate effects at boundaries',
              'Put println in every function',
              'Avoid ADTs',
            ],
            correctIndex: 1,
            explanation: 'That architecture is the practical payoff of FP.',
          },
          {
            id: 'c15-7',
            kind: 'true-false',
            prompt:
              'Monads, applicatives, and monoids are useful partly because laws unlock safe refactoring.',
            correct: true,
            explanation: 'Laws are the contract behind the combinators.',
          },
          {
            id: 'c15-8',
            kind: 'multiple-choice',
            prompt: 'Best next practice after this curriculum?',
            choices: [
              'Only memorize jargon',
              'Implement small ADTs/combinators yourself and write properties for them',
              'Avoid writing Scala',
              'Replace all types with Any',
            ],
            correctIndex: 1,
            explanation: 'Building tiny replicas cement the algebras.',
          },
        ],
      },
    ],
  },
]
