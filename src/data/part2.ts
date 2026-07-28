import type { World } from '../types'

/** Chapters 7–9 — Functional design & combinator libraries */
export const part2: World[] = [
  {
    id: 'ch07-parallelism',
    chapter: 7,
    title: 'Functional Parallelism',
    subtitle: 'Split work, recombine results, keep purity',
    theme: 'Two hammers, one pure result.',
    overview:
      'Parallel computation can stay pure: describe a computation that can run on two halves, then combine. You separate description (what to compute) from execution (how threads run).',
    quests: [
      {
        id: 'c7-par-model',
        title: 'Describe, Then Run',
        blurb: 'Par[A] as a description of parallel computation.',
        xp: 70,
        lessons: [
          {
            heading: 'Why a separate type?',
            body: [
              'If you start threads inside ordinary functions, reasoning gets hard: timing, shared mutation, and order of effects creep in.',
              'A functional design introduces Par[A] — a description of a computation that yields A, which may run in parallel. You build Par values with combinators, then run them at the edge of the program.',
              'Typical primitives: unit/pure (lift a value), map2 (combine two Pars with a function), fork (mark a computation as potentially async).',
            ],
            code: `// Conceptual API (names vary by library)
trait Par[A]

object Par {
  def unit[A](a: A): Par[A] = ???
  def map2[A, B, C](pa: Par[A], pb: Par[B])(f: (A, B) => C): Par[C] = ???
  def fork[A](pa: => Par[A]): Par[A] = ???
  def run[A](pa: Par[A]): A = ???  // impure edge: actually execute
}

// Parallel sum sketch: split list, fork both halves, map2 with +
def sum(ints: IndexedSeq[Int]): Par[Int] =
  if (ints.length <= 1)
    Par.unit(ints.headOption.getOrElse(0))
  else {
    val (l, r) = ints.splitAt(ints.length / 2)
    Par.map2(Par.fork(sum(l)), Par.fork(sum(r)))(_ + _)
  }`,
            callout:
              'map2 is the key: run two independent Pars and combine their results with a pure function.',
          },
        ],
        challenges: [
          {
            id: 'c7-1',
            kind: 'multiple-choice',
            prompt: 'In a functional Par design, run is typically…',
            choices: [
              'Used everywhere inside business logic',
              'Called at the edge to execute a description',
              'Unnecessary because Par is already a result',
              'Only for failing computations',
            ],
            correctIndex: 1,
            explanation:
              'Keep descriptions pure; execute once at the boundary.',
          },
          {
            id: 'c7-2',
            kind: 'multiple-choice',
            prompt: 'map2(pa, pb)(f) means…',
            choices: [
              'Ignore pb and map only pa',
              'Run/combine both sides and apply f to both results',
              'Zip lists only',
              'Always run sequentially on one thread',
            ],
            correctIndex: 1,
            explanation: 'Two parallel results, one combining function.',
          },
          {
            id: 'c7-3',
            kind: 'true-false',
            prompt:
              'fork marks a computation as a candidate to run asynchronously.',
            correct: true,
            explanation: 'fork is the hint to the executor about parallelism.',
          },
          {
            id: 'c7-4',
            kind: 'fill-blank',
            prompt: 'Combine two Par[Int] with addition.',
            template: 'Par.map2(left, right)(_ ___ _)',
            acceptedAnswers: ['+', '+ '],
            explanation: '`_ + _` adds the two results.',
          },
        ],
      },
      {
        id: 'c7-laws',
        title: 'Laws of Combination',
        blurb: 'Refactoring parallel code safely.',
        xp: 50,
        lessons: [
          {
            heading: 'Laws keep meaning stable',
            body: [
              'Combinator libraries need laws: equations that always hold, so you can rewrite programs without changing results.',
              'Example intuition: mapping after unit is like unit of the mapped value. Forking should not change the value computed, only potentially when/where it runs.',
              'Deadlocks and blocking inside combinators are design smells — prefer non-blocking composition of descriptions.',
            ],
          },
        ],
        challenges: [
          {
            id: 'c7-5',
            kind: 'true-false',
            prompt:
              'Good Par laws imply that fork should not change the computed value, only scheduling.',
            correct: true,
            explanation: 'Semantics stay; execution strategy may change.',
          },
          {
            id: 'c7-6',
            kind: 'multiple-choice',
            prompt: 'Why separate “description” from “execution”?',
            choices: [
              'Scala requires it for generics',
              'So pure composition stays testable and reason-able before threads run',
              'Descriptions cannot represent parallel work',
              'Execution is always slower',
            ],
            correctIndex: 1,
            explanation: 'You compose safely, then run once.',
          },
          {
            id: 'c7-7',
            kind: 'spot-bug',
            prompt: 'Which line smuggles impurity into the core?',
            lines: [
              'def parallelSum(xs: List[Int]): Int = {',
              '  val mid = xs.length / 2',
              '  val f = Future(xs.take(mid).sum)',
              '  val g = Future(xs.drop(mid).sum)',
              '  Await.result(f, 1.second) + Await.result(g, 1.second)',
              '}',
            ],
            buggyLine: 4,
            explanation:
              'Await blocks and mixes execution into the function. A Par-style API would return a description instead of awaiting inside.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch08-property-testing',
    chapter: 8,
    title: 'Property-Based Testing',
    subtitle: 'State properties; generate hundreds of cases',
    theme: 'One property beats a dozen hand-picked examples.',
    overview:
      'Example tests check a few cases. Property-based tests state a general law and generate random inputs. Shrinking finds a minimal failing case.',
    quests: [
      {
        id: 'c8-properties',
        title: 'Properties, Not Examples',
        blurb: 'Express laws your code must always obey.',
        xp: 65,
        lessons: [
          {
            heading: 'From assertEquals to forall',
            body: [
              'A property says: for all inputs drawn from a generator, this predicate holds.',
              'Generators (Gen[A]) know how to produce random A values and often how to shrink them when a test fails.',
              'Classic properties: list reverse is its own inverse; map preserves size; monoid laws; parse then print round-trips.',
            ],
            code: `// Conceptual property API
trait Gen[A] { def sample: A }

trait Prop {
  def check: Boolean
}

// Example properties (pseudocode / ScalaCheck-style)
// forAll(Gen.listOf(Gen.int)) { xs => xs.reverse.reverse == xs }
// forAll(Gen.int) { n => Math.abs(n) >= 0 }  // careful: Int.MinValue!

def listLengthMap[A, B](as: List[A], f: A => B): Boolean =
  as.map(f).length == as.length`,
            callout:
              'When a property fails, shrinking searches for a smaller counterexample — gold for debugging.',
          },
        ],
        challenges: [
          {
            id: 'c8-1',
            kind: 'multiple-choice',
            prompt: 'Property-based testing primarily…',
            choices: [
              'Replaces the type checker',
              'Checks general laws on many generated inputs',
              'Only tests UI components',
              'Guarantees total correctness for all programs',
            ],
            correctIndex: 1,
            explanation: 'Generate cases from properties; not a full proof.',
          },
          {
            id: 'c8-2',
            kind: 'true-false',
            prompt:
              'Shrinking tries to find a simpler failing input after a property fails.',
            correct: true,
            explanation: 'Minimal counterexamples are easier to understand.',
          },
          {
            id: 'c8-3',
            kind: 'fill-blank',
            prompt: 'Complete the reverse involution property.',
            template: 'xs.reverse.___ == xs',
            acceptedAnswers: ['reverse'],
            explanation: 'Reversing twice yields the original list.',
          },
          {
            id: 'c8-4',
            kind: 'multiple-choice',
            prompt: 'A Gen[A] is responsible for…',
            choices: [
              'Compiling A',
              'Producing (and often shrinking) random A values',
              'Replacing Option',
              'Running on the JVM only',
            ],
            correctIndex: 1,
            explanation: 'Generators feed properties with sample data.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch09-parsers',
    chapter: 9,
    title: 'Parser Combinators',
    subtitle: 'Build parsers from small parsers',
    theme: 'Grammar as a library of pure combinators.',
    overview:
      'Instead of one giant parser, build tiny parsers (char, string, regex) and combine them: sequence, choice, repetition. The library design teaches algebraic thinking.',
    quests: [
      {
        id: 'c9-combinators',
        title: 'Parsers as Values',
        blurb: 'Sequence, choose, and repeat.',
        xp: 75,
        lessons: [
          {
            heading: 'The algebra of parsing',
            body: [
              'A Parser[A] consumes input and yields an A (or an error). Combinators build bigger parsers from smaller ones without you hand-writing a state machine each time.',
              'Useful ideas: succeed/pure, fail, char/string literals, map over results, product/sequence (run one then another), orElse (try A, else B), many/many1 for repetition.',
              'Errors should report location and expectation — good libraries thread error information through failures.',
            ],
            code: `// Conceptual parser algebra
trait Parser[+A]

def string(s: String): Parser[String]
def char(c: Char): Parser[Char]
def or[A](p1: Parser[A], p2: => Parser[A]): Parser[A]
def map[A, B](p: Parser[A])(f: A => B): Parser[B]
def product[A, B](pa: Parser[A], pb: => Parser[B]): Parser[(A, B)]
def many[A](p: Parser[A]): Parser[List[A]]

// "foo" or "bar"
val foobar = or(string("foo"), string("bar"))

// two digits as a pair
val twoDigits = product(char('1'), char('2'))  // simplistic`,
            callout:
              'Product/sequence must often delay the second parser (by-name) so choice and recursion work.',
          },
        ],
        challenges: [
          {
            id: 'c9-1',
            kind: 'multiple-choice',
            prompt: 'Parser combinators encourage…',
            choices: [
              'One monolithic regex for the whole language',
              'Composing small parsers with algebraic operators',
              'Only mutable token buffers',
              'Avoiding error messages',
            ],
            correctIndex: 1,
            explanation: 'Small parsers + combinators = readable grammars.',
          },
          {
            id: 'c9-2',
            kind: 'true-false',
            prompt:
              'orElse/or tries one parser and, on failure, tries another.',
            correct: true,
            explanation: 'Choice is a core combinator.',
          },
          {
            id: 'c9-3',
            kind: 'fill-blank',
            prompt: 'Map a parsed string to its length.',
            template: 'map(string("hi"))(s => s.___)',
            acceptedAnswers: ['length', 'size'],
            explanation: 'Transform the successful result with map.',
          },
          {
            id: 'c9-4',
            kind: 'multiple-choice',
            prompt: 'many(p) typically means…',
            choices: [
              'Parse p exactly once',
              'Parse p zero or more times into a List',
              'Parse the entire file as raw bytes',
              'Fail unless p fails',
            ],
            correctIndex: 1,
            explanation: 'Repetition combinator accumulating a list.',
          },
          {
            id: 'c9-5',
            kind: 'spot-bug',
            prompt: 'Which approach fights the combinator style?',
            lines: [
              'val num = regex("\\\\d+".r)',
              'val plus = char(\'+\')',
              'val expr = product(num, product(plus, num))',
              'val hardcoded = (in: String) =>',
              '  if (in == "1+2") Right(3) else Left("nope")',
            ],
            buggyLine: 3,
            explanation:
              'A one-off hardcoded function does not compose. Prefer combining num/plus parsers.',
          },
        ],
      },
    ],
  },
]
