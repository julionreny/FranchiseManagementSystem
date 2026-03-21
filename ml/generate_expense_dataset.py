import random
import pandas as pd

high = [
"diesel for delivery van","petrol bulk purchase","monthly staff salary",
"shop rent payment","generator repair urgent","AC compressor replacement",
"deep freezer repair","kitchen equipment servicing","POS machine purchase",
"bulk inventory purchase","fire extinguisher refill","vehicle servicing",
"insurance renewal vehicle","major plumbing repair","roof leakage repair",
"rolling shutter repair","electrical wiring replacement","new oven purchase",
"franchise royalty payment","exhaust fan motor repair"
]

medium = [
"wifi bill payment","electricity bill shop","printer ink refill",
"software subscription renewal","staff uniform purchase","minor plumbing work",
"window glass replacement","menu printing expense","social media ads",
"packing materials purchase","delivery box purchase","UPS battery replacement",
"cleaning service payment","water purifier service","banner printing",
"internet router replacement","utensil replacement","storage rack purchase",
"floor cleaning machine rent","gas cylinder refill"
]

low = [
"tea snacks for staff","office decoration items","cleaning materials purchase",
"festival sweets office","staff lunch treat","air freshener refill",
"water bottle stock","stationery purchase","whiteboard markers",
"plastic container purchase","light bulb replacement","dustbin purchase",
"pantry grocery refill","table cloth purchase","soap refill washroom",
"door curtain purchase","plant decoration purchase","paper cup stock",
"mobile cover purchase","birthday cake expense"
]

rows = []

for i in range(1000):
    p = random.choice(["high","medium","low"])
    if p == "high":
        text = random.choice(high)
    elif p == "medium":
        text = random.choice(medium)
    else:
        text = random.choice(low)

    rows.append([text, p])

df = pd.DataFrame(rows, columns=["text","priority"])
df.to_csv("expense_priority_1000.csv", index=False)

print("✅ 1000 line dataset created")