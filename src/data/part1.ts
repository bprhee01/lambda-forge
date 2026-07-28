import type { World } from '../types'

/** Chapters 1–6 — Introduction to Functional Programming (original lessons) */
export const part1: World[] = [
  {
    id: 'ch01-what-is-fp',
    chapter: 1,
    title: 'What Is FP?',
    subtitle: 'Purity, referential transparency, and side effects',
    theme: 'The forge heats only when the metal stays pure.',
    overview:
      'Functional programming means building programs from pure functions — ones that compute results without changing the outside world. This chapter teaches the mindset.',
    quests: [
      {
        id: 'c1-purity',
        title: 'Purity & Side Effects',
        blurb: 'Learn what makes a function pure and why it matters.',
        xp: 50,
        lessons: [
          {
            heading: 'A pure function',
            body: [
              'A pure function is like a mathematical function: given the same inputs, it always returns the same output, and it does nothing else observable.',
              '“Nothing else” means no printing, no writing files, no mutating shared variables, no throwing into distant catch blocks, no reading the clock or random generator as hidden inputs.',
              'Those extra behaviors are called side effects. Side effects are not evil forever — real programs need I/O — but we push them to the edges so the core of the program stays easy to reason about.',
            ],
            code: `// Pure: only depends on inputs, only returns a value
def area(width: Double, height: Double): Double =
  width * height

// Impure: talks to the outside world
def areaAndPrint(w: Double, h: Double): Double = {
  val a = w * h
  println(s"area = $a")  // side effect
  a
}`,
          },
          {
            heading: 'Referential transparency',
            body: [
              'An expression is referentially transparent if you can replace it with its value everywhere without changing the program’s meaning.',
              'If x = 2 + 3, then any use of x can become 5. That substitution property is how FP programmers simplify and refactor with confidence.',
              'When code has hidden side effects, substitution breaks: calling a function twice may print twice, or return different values because of mutable state.',
            ],
            callout:
              'Rule of thumb: if you cannot safely replace a call with its result, something impure is involved.',
          },
        ],
        challenges: [
          {
            id: 'c1-purity-1',
            kind: 'multiple-choice',
            prompt:
              'Which property means an expression can be replaced by its value without changing meaning?',
            choices: [
              'Polymorphism',
              'Referential transparency',
              'Type erasure',
              'Lazy evaluation',
            ],
            correctIndex: 1,
            explanation:
              'Referential transparency is exactly that substitution property — the hallmark of purity.',
          },
          {
            id: 'c1-purity-2',
            kind: 'spot-bug',
            prompt: 'Tap the line that performs a side effect.',
            lines: [
              'def double(n: Int): Int =',
              '  n * 2',
              '',
              'def shout(msg: String): String = {',
              '  println(msg)',
              '  msg.toUpperCase',
              '}',
            ],
            buggyLine: 4,
            explanation:
              'println mutates the outside world (the console). That breaks referential transparency.',
          },
          {
            id: 'c1-purity-3',
            kind: 'true-false',
            prompt:
              'A pure function may throw an exception when given invalid input.',
            correct: false,
            explanation:
              'Throwing is non-local control flow / an effect. Prefer returning Option, Either, or similar.',
          },
          {
            id: 'c1-purity-4',
            kind: 'fill-blank',
            prompt: 'Complete this pure add function.',
            template: 'def add(a: Int, b: Int): Int = ___',
            acceptedAnswers: ['a + b', 'a+b', '(a + b)', '(a+b)'],
            explanation: 'Return the sum — no printing, mutation, or I/O.',
          },
        ],
      },
      {
        id: 'c1-rt-practice',
        title: 'Substitution Practice',
        blurb: 'Train your eye to replace expressions with values.',
        xp: 45,
        lessons: [
          {
            heading: 'Equational reasoning',
            body: [
              'Because pure expressions equal their values, you can transform programs like algebra: expand, substitute, simplify.',
              'Example: def inc(n: Int) = n + 1. Then inc(inc(3)) = inc(4) = 5. No need to “run” a mental machine with hidden state.',
              'This is why FP favors vals over vars for domain logic, and why we return new data instead of mutating old data.',
            ],
            code: `val x = 2 + 3          // x is interchangeable with 5
val y = x * x          // means 5 * 5
// If computing x printed something, substituting 5 would change behavior.`,
          },
        ],
        challenges: [
          {
            id: 'c1-rt-1',
            kind: 'multiple-choice',
            prompt: 'Given `val x = 2 + 3`, which rewrite is valid?',
            choices: [
              'Replace every `x` with `println(5)`',
              'Replace every `x` with `5`',
              'Replace every `x` with `2 + 3 + random()`',
              'Never replace `x`; vals are opaque',
            ],
            correctIndex: 1,
            explanation: 'Because `2 + 3` is pure, `x` and `5` are interchangeable.',
          },
          {
            id: 'c1-rt-2',
            kind: 'true-false',
            prompt:
              'If `f(x)` is referentially transparent, calling it twice with the same `x` yields the same result.',
            correct: true,
            explanation: 'Same inputs → same outputs, with no observable side effects.',
          },
          {
            id: 'c1-rt-3',
            kind: 'multiple-choice',
            prompt: 'Why do FP programmers distrust shared `var`s in core logic?',
            choices: [
              'Scala cannot compile `var`',
              'Mutation makes substitution and reasoning harder',
              '`var` is always slower than `val`',
              '`var` only works inside objects',
            ],
            correctIndex: 1,
            explanation:
              'Shared mutable state breaks easy equational reasoning even when locally convenient.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch02-getting-started',
    chapter: 2,
    title: 'Getting Started',
    subtitle: 'Higher-order functions, polymorphism, and recursion',
    theme: 'Loops become recursion; functions become values.',
    overview:
      'Scala lets you pass functions as values, write generic algorithms once, and replace loops with recursion (including stack-safe tail recursion).',
    quests: [
      {
        id: 'c2-hof',
        title: 'Higher-Order Functions',
        blurb: 'Functions that take or return functions.',
        xp: 55,
        lessons: [
          {
            heading: 'Functions as values',
            body: [
              'A higher-order function (HOF) takes another function as an argument, returns a function, or both.',
              'In Scala, function values have types like Int => Boolean. Methods (def) are not values until you eta-expand them (e.g. foo _ or pass them where a function is expected).',
              'HOFs let you abstract over behavior: “do this for every element” (map), “keep some elements” (filter), “combine into one” (fold).',
            ],
            code: `def applyTwice[A](f: A => A, a: A): A =
  f(f(a))

val plusOne = (x: Int) => x + 1
applyTwice(plusOne, 3)  // 5

// Polymorphic: works for every A
def identity[A](a: A): A = a`,
            callout:
              'Parametric polymorphism means the implementation cannot invent special cases for specific types — it must work uniformly.',
          },
        ],
        challenges: [
          {
            id: 'c2-hof-1',
            kind: 'fill-blank',
            prompt: 'Fill so applyTwice applies f twice.',
            template: 'def applyTwice[A](f: A => A, a: A): A =\n  f(___)',
            acceptedAnswers: ['f(a)', '(f(a))'],
            explanation: '`f(f(a))` composes the function with itself.',
          },
          {
            id: 'c2-hof-2',
            kind: 'multiple-choice',
            prompt: 'What is the type of `(x: Int) => x > 0`?',
            choices: ['Int', 'Boolean', 'Int => Boolean', '() => Int'],
            correctIndex: 2,
            explanation: 'Takes Int, returns Boolean.',
          },
          {
            id: 'c2-hof-3',
            kind: 'true-false',
            prompt:
              'In Scala, every `def` method is automatically a function value of type A => B.',
            correct: false,
            explanation:
              'Methods need eta-expansion to become values. Function vals already have arrow types.',
          },
          {
            id: 'c2-hof-4',
            kind: 'multiple-choice',
            prompt: '`def identity[A](a: A): A` means…',
            choices: [
              'It only works for Any',
              'The caller chooses A; the body cannot invent another type',
              'It always returns null',
              'It must pattern-match on A',
            ],
            correctIndex: 1,
            explanation: 'One uniform implementation for every type A.',
          },
        ],
      },
      {
        id: 'c2-recursion',
        title: 'Recursion & Tail Calls',
        blurb: 'Replace loops with recursion; keep the stack safe.',
        xp: 60,
        lessons: [
          {
            heading: 'From loops to recursion',
            body: [
              'In FP we often avoid while-loops that mutate counters. Instead we write recursive functions: solve a small case, then combine with a recursive call on a smaller input.',
              'Naive recursion can blow the stack. A call is in tail position if it is the last thing the function does — no pending multiplication or other work after the call returns.',
              'Annotate with @tailrec so the compiler verifies and optimizes tail recursion into a loop.',
            ],
            code: `import scala.annotation.tailrec

// NOT tail-recursive: multiply happens after the call
def fact(n: Int): Int =
  if (n <= 1) 1 else n * fact(n - 1)

// Tail-recursive with accumulator
def factTR(n: Int): Int = {
  @tailrec
  def go(k: Int, acc: Int): Int =
    if (k <= 1) acc else go(k - 1, k * acc)
  go(n, 1)
}`,
          },
        ],
        challenges: [
          {
            id: 'c2-tail-1',
            kind: 'fill-blank',
            prompt: 'Complete recursive factorial.',
            template:
              'def fact(n: Int): Int =\n  if (n <= 1) 1 else n * ___(n - 1)',
            acceptedAnswers: ['fact'],
            explanation: '`n * fact(n - 1)` — classic recursion.',
          },
          {
            id: 'c2-tail-2',
            kind: 'multiple-choice',
            prompt: 'A tail-recursive call is one where…',
            choices: [
              'The recursive call is the very last action',
              'The function calls itself at least twice',
              'The function uses @inline',
              'The call happens inside map',
            ],
            correctIndex: 0,
            explanation: 'Tail position lets Scala reuse the stack frame.',
          },
          {
            id: 'c2-tail-3',
            kind: 'spot-bug',
            prompt: 'Which line breaks tail position?',
            lines: [
              'def fact(n: Int): Int = {',
              '  def go(k: Int, acc: Int): Int =',
              '    if (k <= 1) acc',
              '    else k * go(k - 1, acc)',
              '  go(n, 1)',
              '}',
            ],
            buggyLine: 3,
            explanation:
              '`k * go(...)` does work after the call. Use `go(k - 1, k * acc)` instead.',
          },
          {
            id: 'c2-tail-4',
            kind: 'true-false',
            prompt:
              '`@tailrec` makes the compiler error if the method is not actually tail-recursive.',
            correct: true,
            explanation: 'The annotation is a compile-time safety check.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch03-data-structures',
    chapter: 3,
    title: 'Functional Data',
    subtitle: 'Lists, trees, folds, and algebraic data types',
    theme: 'Data is built from sums and products — then folded.',
    overview:
      'Immutable lists and trees are algebraic data types (ADTs). You define them with sealed traits and case classes, then process them with pattern matching and folds.',
    quests: [
      {
        id: 'c3-adt-list',
        title: 'Lists as ADTs',
        blurb: 'Nil, Cons, pattern matching, and structural recursion.',
        xp: 65,
        lessons: [
          {
            heading: 'Algebraic data types',
            body: [
              'An ADT is built from sums (or / alternatives) and products (and / fields). List is either empty (Nil) or a cell with a head and a tail (Cons).',
              'In Scala we model this with a sealed trait and case classes/objects. sealed helps the compiler check that pattern matches cover every case.',
              'Structural recursion: match on the shape, handle Nil, and for Cons combine the head with a recursive result on the tail.',
            ],
            code: `sealed trait List[+A]
case object Nil extends List[Nothing]
case class Cons[+A](head: A, tail: List[A]) extends List[A]

def sum(ints: List[Int]): Int = ints match {
  case Nil => 0
  case Cons(x, xs) => x + sum(xs)
}

// Scala's stdlib List uses :: instead of Cons
def length[A](as: List[A]): Int = as match {
  case Nil => 0
  case _ :: t => 1 + length(t)
}`,
          },
          {
            heading: 'Fold means “replace the constructors”',
            body: [
              'foldRight on a list replaces Nil with a starting value z, and each Cons(h, t) with a combining function f(h, …).',
              'Once you have fold, many functions (sum, product, length, even map) can be expressed as folds — one recursion pattern, many uses.',
            ],
            code: `def foldRight[A, B](as: List[A], z: B)(f: (A, B) => B): B =
  as match {
    case Nil => z
    case h :: t => f(h, foldRight(t, z)(f))
  }

def sum(ns: List[Int]) = foldRight(ns, 0)(_ + _)
def product(ns: List[Int]) = foldRight(ns, 1)(_ * _)`,
          },
        ],
        challenges: [
          {
            id: 'c3-list-1',
            kind: 'multiple-choice',
            prompt: 'A Scala List is best described as…',
            choices: [
              'A mutable array you update in place',
              'An ADT: Nil or Cons(head, tail)',
              'Only usable with for-comprehensions',
              'A structure that never shares tails',
            ],
            correctIndex: 1,
            explanation: 'Immutable lists are ADTs processed by pattern matching.',
          },
          {
            id: 'c3-list-2',
            kind: 'fill-blank',
            prompt: 'Fill in list length.',
            template:
              'def length[A](as: List[A]): Int = as match {\n  case Nil => 0\n  case _ :: t => 1 + ___(t)\n}',
            acceptedAnswers: ['length'],
            explanation: 'Count 1 for the head, recurse on the tail.',
          },
          {
            id: 'c3-list-3',
            kind: 'multiple-choice',
            prompt: 'What does foldRight express?',
            choices: [
              'In-place mutation left to right',
              'Replacing Nil/Cons with a zero and a combining function',
              'Sorting the list',
              'Only parallel evaluation',
            ],
            correctIndex: 1,
            explanation: 'Fold is structure recursion over the ADT constructors.',
          },
          {
            id: 'c3-list-4',
            kind: 'true-false',
            prompt: '`List(1,2,3).map(_ + 1)` leaves the original list unchanged.',
            correct: true,
            explanation: 'Immutability: transformations return new structures.',
          },
        ],
      },
      {
        id: 'c3-trees',
        title: 'Trees & map',
        blurb: 'Branching data needs branching recursion.',
        xp: 55,
        lessons: [
          {
            heading: 'Binary trees',
            body: [
              'A tree ADT might be Leaf(value) or Branch(left, right). Size, depth, and maximum are recursive over both sides.',
              'map on a tree transforms leaf values while preserving shape — the same functor idea you saw on List.',
            ],
            code: `sealed trait Tree[+A]
case class Leaf[A](value: A) extends Tree[A]
case class Branch[A](left: Tree[A], right: Tree[A]) extends Tree[A]

def size[A](t: Tree[A]): Int = t match {
  case Leaf(_) => 1
  case Branch(l, r) => size(l) + size(r)
}

def map[A, B](t: Tree[A])(f: A => B): Tree[B] = t match {
  case Leaf(a) => Leaf(f(a))
  case Branch(l, r) => Branch(map(l)(f), map(r)(f))
}`,
          },
        ],
        challenges: [
          {
            id: 'c3-tree-1',
            kind: 'fill-blank',
            prompt: 'Complete tree size.',
            template:
              'def size[A](t: Tree[A]): Int = t match {\n  case Leaf(_) => 1\n  case Branch(l, r) => size(l) + ___(r)\n}',
            acceptedAnswers: ['size'],
            explanation: '`size(l) + size(r)`.',
          },
          {
            id: 'c3-tree-2',
            kind: 'multiple-choice',
            prompt: 'Why seal the Tree trait?',
            choices: [
              'For serialization',
              'So matches can be checked for exhaustiveness',
              'To allow mutating leaves',
              'Sealing is required for generics',
            ],
            correctIndex: 1,
            explanation: 'sealed keeps subtypes local; the compiler warns on missing cases.',
          },
          {
            id: 'c3-tree-3',
            kind: 'true-false',
            prompt: 'map on a tree should preserve the tree’s shape.',
            correct: true,
            explanation: 'Classic functor behavior: transform values, keep structure.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch04-errors',
    chapter: 4,
    title: 'Errors Without Exceptions',
    subtitle: 'Option, Either, and total functions',
    theme: 'Failures become values you can compose.',
    overview:
      'Instead of throwing, return values that represent failure: Option for absence, Either for errors with information. Compose them with map, flatMap, and for-comprehensions.',
    quests: [
      {
        id: 'c4-option',
        title: 'Option Rising',
        blurb: 'Replace null and thrown exceptions with Option.',
        xp: 70,
        lessons: [
          {
            heading: 'Make failure visible in the type',
            body: [
              'Option[A] is either Some(value) or None. The type tells callers a value might be missing — unlike null, which lurks in plain A.',
              'map transforms the value inside Some; None stays None. flatMap is for when your function itself returns Option (avoids Option[Option[A]]).',
              'Avoid .get — it throws if empty and undoes the safety. Prefer getOrElse, fold, pattern matching, or for-comprehensions.',
            ],
            code: `def reciprocal(n: Double): Option[Double] =
  if (n == 0) None else Some(1 / n)

def parseInt(s: String): Option[Int] =
  try Some(s.toInt)
  catch { case _: NumberFormatException => None }

// Sequencing
for {
  i <- parseInt("4")
  r <- reciprocal(i.toDouble)
} yield r`,
            callout:
              'for-comprehensions over Option desugar to flatMap/map — fail-fast on the first None.',
          },
        ],
        challenges: [
          {
            id: 'c4-option-1',
            kind: 'multiple-choice',
            prompt: 'Option[A] is either…',
            choices: [
              'Some(value) or None',
              'Success or Failure',
              'Left or Right',
              'Try or Catch',
            ],
            correctIndex: 0,
            explanation: 'Option models presence/absence.',
          },
          {
            id: 'c4-option-2',
            kind: 'fill-blank',
            prompt: 'Safe reciprocal when n is 0.',
            template:
              'def reciprocal(n: Double): Option[Double] =\n  if (n == 0) ___ else Some(1 / n)',
            acceptedAnswers: ['None'],
            explanation: 'None signals no reciprocal without throwing.',
          },
          {
            id: 'c4-option-3',
            kind: 'multiple-choice',
            prompt: 'What does opt.map(f) do when opt is None?',
            choices: [
              'Calls f with null',
              'Returns None without calling f',
              'Throws NoSuchElementException',
              'Returns Some(f())',
            ],
            correctIndex: 1,
            explanation: 'Empty stays empty; f is not applied.',
          },
          {
            id: 'c4-option-4',
            kind: 'true-false',
            prompt:
              'Use flatMap when the function you apply already returns an Option.',
            correct: true,
            explanation: 'map would nest Option[Option[A]]; flatMap flattens.',
          },
          {
            id: 'c4-option-5',
            kind: 'spot-bug',
            prompt: 'Which line reintroduces unsafety?',
            lines: [
              'def parseInt(s: String): Option[Int] =',
              '  try Some(s.toInt) catch { case _: NumberFormatException => None }',
              '',
              'val n = parseInt("nope").get',
              'println(n)',
            ],
            buggyLine: 3,
            explanation: '.get throws on None. Prefer getOrElse or flatMap.',
          },
        ],
      },
      {
        id: 'c4-either',
        title: 'Either Hand',
        blurb: 'Carry an error value on the Left.',
        xp: 55,
        lessons: [
          {
            heading: 'When None is not enough',
            body: [
              'Option hides why something failed. Either[E, A] holds either an error E (by convention Left) or a success A (Right).',
              'Scala’s Either is right-biased: map and flatMap operate on Right, just like Option’s Some.',
              'You can accumulate or convert errors later; for now, practice returning Left(message) on invalid input.',
            ],
            code: `def nonNegative(age: Int): Either[String, Int] =
  if (age < 0) Left("age must be >= 0") else Right(age)

def parseAge(s: String): Either[String, Int] =
  try {
    val n = s.toInt
    nonNegative(n)
  } catch {
    case _: NumberFormatException => Left(s"not an int: $s")
  }`,
          },
        ],
        challenges: [
          {
            id: 'c4-either-1',
            kind: 'multiple-choice',
            prompt: 'By convention, Either[E, A] uses…',
            choices: [
              'Left for success, Right for error',
              'Right for success, Left for error',
              'Both sides for success',
              'Only Right; Left is deprecated',
            ],
            correctIndex: 1,
            explanation: 'Right-biased Either: success on the Right.',
          },
          {
            id: 'c4-either-2',
            kind: 'fill-blank',
            prompt: 'Fail when age is negative (any clear message is fine).',
            template:
              'def nonNegative(age: Int): Either[String, Int] =\n  if (age < 0) Left(___) else Right(age)',
            acceptedAnswers: [
              '"age must be >= 0"',
              '"negative age"',
              '"invalid age"',
              '"age < 0"',
            ],
            placeholder: '"error message"',
            explanation: 'Left carries the error; Right carries the value.',
          },
          {
            id: 'c4-either-3',
            kind: 'true-false',
            prompt:
              'for-comprehensions over Option/Either desugar to flatMap and map.',
            correct: true,
            explanation: 'That is how sequential composition stays readable.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch05-laziness',
    chapter: 5,
    title: 'Strictness & Laziness',
    subtitle: 'Thunks, lazy vals, and on-demand sequences',
    theme: 'Compute only what the forge needs — when it needs it.',
    overview:
      'Strict evaluation computes arguments before a call. Lazy evaluation delays work until needed. Streams/LazyLists use laziness to express large or infinite pipelines efficiently.',
    quests: [
      {
        id: 'c5-thunks',
        title: 'Thunks & lazy val',
        blurb: 'Control when expressions run.',
        xp: 60,
        lessons: [
          {
            heading: 'By-name and lazy',
            body: [
              'A by-name parameter x: => A passes an unevaluated expression. Each time the body mentions x, the expression runs again (unless you cache it).',
              'lazy val memoizes: the initializer runs at most once, on first access.',
              'Laziness lets you define infinite sequences and pull only a finite prefix — think LazyList.continually(1).take(5).',
            ],
            code: `def if2[A](cond: Boolean, onTrue: => A, onFalse: => A): A =
  if (cond) onTrue else onFalse
// Only one branch is evaluated

lazy val expensive = {
  println("computing")
  42
}

val ones: LazyList[Int] = 1 #:: ones
ones.take(3).toList  // List(1,1,1)`,
            callout:
              'Lazy streams can fuse maps/filters so you do not build huge intermediate lists.',
          },
        ],
        challenges: [
          {
            id: 'c5-lazy-1',
            kind: 'multiple-choice',
            prompt: 'A by-name parameter `x: => A` means…',
            choices: [
              'x is evaluated once at definition time',
              'x is re-evaluated each time it is referenced',
              'x must be a lazy val',
              'x is always () => A at the call site syntax-wise',
            ],
            correctIndex: 1,
            explanation: 'By-name args are thunks evaluated on each use.',
          },
          {
            id: 'c5-lazy-2',
            kind: 'true-false',
            prompt: '`lazy val` runs its initializer at most once.',
            correct: true,
            explanation: 'First access computes and caches.',
          },
          {
            id: 'c5-lazy-3',
            kind: 'multiple-choice',
            prompt: 'Why do lazy streams help with large pipelines?',
            choices: [
              'They mutate faster than arrays',
              'They compute on demand and can avoid huge intermediates',
              'They disable GC',
              'They only store Int',
            ],
            correctIndex: 1,
            explanation: 'On-demand + fusion keeps memory and work in check.',
          },
          {
            id: 'c5-lazy-4',
            kind: 'fill-blank',
            prompt: 'Read the first element of ones.',
            template: 'val ones: LazyList[Int] = 1 #:: ones\nval h = ones.___',
            acceptedAnswers: ['head'],
            explanation: 'Accessing head forces only what is needed.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch06-state',
    chapter: 6,
    title: 'Functional State',
    subtitle: 'RNG and State as functions you thread through',
    theme: 'State is a value you pass — not a hidden mutable cell.',
    overview:
      'Mutable random generators are impure. Make state explicit: a transition is a function S => (A, S). That is the State pattern — reusable for RNG and beyond.',
    quests: [
      {
        id: 'c6-rng',
        title: 'Random Without Vars',
        blurb: 'Model RNG as (value, nextRng) pairs.',
        xp: 70,
        lessons: [
          {
            heading: 'Make the seed explicit',
            body: [
              'An impure RNG mutates an internal seed. A pure API returns both the random value and the next generator: (A, RNG).',
              'If you reuse the same RNG without threading the next one, you get the same outputs — purity means determinism.',
              'State[S, A] is a type alias (or wrapper) for S => (A, S). map changes A; flatMap sequences two stateful steps while passing S along.',
            ],
            code: `trait RNG {
  def nextInt: (Int, RNG)
}

// State transition
type State[S, A] = S => (A, S)

def map[S, A, B](sa: State[S, A])(f: A => B): State[S, B] =
  s => {
    val (a, s2) = sa(s)
    (f(a), s2)
  }

def flatMap[S, A, B](sa: State[S, A])(f: A => State[S, B]): State[S, B] =
  s => {
    val (a, s2) = sa(s)
    f(a)(s2)
  }`,
          },
        ],
        challenges: [
          {
            id: 'c6-rng-1',
            kind: 'multiple-choice',
            prompt: 'A pure RNG API typically returns…',
            choices: [
              'Only the Int, mutating an internal seed',
              'A pair (result, nextRng)',
              'Unit after printing',
              'Future[Int]',
            ],
            correctIndex: 1,
            explanation: 'Returning the next generator keeps transitions pure.',
          },
          {
            id: 'c6-rng-2',
            kind: 'true-false',
            prompt:
              'Reusing the same RNG instance for two calls can yield the same output twice.',
            correct: true,
            explanation: 'Same seed → same sequence. Thread the updated RNG.',
          },
          {
            id: 'c6-rng-3',
            kind: 'fill-blank',
            prompt: 'Complete the State type alias.',
            template: 'type State[S, A] = S => (___, S)',
            acceptedAnswers: ['A', '(A)'],
            explanation: 'From state to (result, new state).',
          },
          {
            id: 'c6-rng-4',
            kind: 'multiple-choice',
            prompt: 'map on State[S, A] lets you…',
            choices: [
              'Change A without altering how S is threaded',
              'Discard state entirely',
              'Change S’s type automatically',
              'Run state in parallel',
            ],
            correctIndex: 0,
            explanation: 'Map transforms the output value; state-passing remains.',
          },
        ],
      },
    ],
  },
]
