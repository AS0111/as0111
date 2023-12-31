(ns mire.player)

(def ^:dynamic *current-room*)
(def ^:dynamic *inventory*)
(def ^:dynamic *name*)

(defn calc-attack
  [lvl]
  (* lvl 10))
(defn calc-defence
  [lvl]
  (int (* lvl 5)))
(defn calc-hitpoints
  [lvl]
  (* lvl 100))

(defn create-character
  [name lvl]
  {
   :name name
   :lvl lvl
   :att (calc-attack lvl)
   :def (calc-defence lvl)
   :hp (calc-hitpoints lvl)
   })

(defn real-damage
  [from]
  (let [att (:att from)]
    (cond
      (< att 50) 250
      (>= att 50) att)))

(defn take-damage
  [from to]
  (let [rd (:att from)]
    [rd (update-in to [:hp] #(- % rd))]))

(defn take-damage-win
  [from to]
  (let [rd (real-damage from)]
    [rd (update-in to [:hp] #(- % rd))]))

(def player (create-character "you" 1))
(def spirit (create-character "spirit" 5))



(def log-template
  " %s received %d damage.
  his hp = %d")

(def log-template-win
  " %s received %d damage.
  his hp = %d")

(defn print-attack-log
  [damage character]
  (let [name (:name character)
        newhp (:hp character)
        s (format log-template name damage newhp)]
    (println s)))

(defn print-attack-log-win
  [damage character]
  (let [name (:name character)
        newhp (:hp character)
        s (format log-template-win name damage newhp)]
    (println s)))

(defn print-winner
  [p-hp e-hp]
  (if (<= e-hp 0)
    (println "
             You win!")
    (println "
             Spirit win")))

(defn carrying? [thing]
  (some #{(keyword thing)} @*inventory*))

(defn game-logic
  [config]
  (loop [player (:player config)
         enemy (:enemy config)
         round 1]
    (if (or (<= (:hp player) 0)
            (<= (:hp enemy) 0))
      (print-winner (:hp player) (:hp enemy))
        (let [pl->en (take-damage player enemy)
              en->pl (take-damage enemy player)]
          (do (print-attack-log (pl->en 0) (pl->en 1))
              (print-attack-log (en->pl 0) (en->pl 1))
              (recur (en->pl 1) (pl->en 1) (inc round)))))))

(defn game-logic-win
  [config]
  (loop [player (:player config)
         enemy (:enemy config)
         round 1]
    (if (or (<= (:hp enemy) 0)
            (<= (:hp player) 0))
      (print-winner (:hp enemy) (:hp player))
        (let [pl->en (take-damage-win player enemy)
              en->pl (take-damage-win enemy player)]
          (do (print-attack-log (pl->en 0) (pl->en 1))
              (print-attack-log (en->pl 0) (en->pl 1))
              (recur (en->pl 1) (pl->en 1) (inc round)))))))

(def prompt "> ")
(def streams (ref {}))


