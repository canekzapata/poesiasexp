import schemdraw
import schemdraw.elements as elm
import random

# Textos poéticos por tema (puedes agregar más)
temas = {
    "literatura": ["Bloqueo del escritor", "Verso de Borges", "Pluma de Cortázar", "Laberinto de Eco", "Epifanía de Joyce"],
    "musica": ["Riff de Hendrix", "Pulso de Kraftwerk", "Nota de Bach", "Electricidad de OMD", "Corriente de Aphex Twin"],
    "circuitos": ["Corriente creativa", "Voltaje de la idea", "Resistencia al conformismo", "LED de la epifanía", "Amplificador del alma"]
}

def generar_circuito_poetico(tema="literatura", filename="circuito_poetico.png"):
    tema = tema.lower()
    if tema not in temas:
        tema = random.choice(list(temas.keys()))
    
    # Elegir textos aleatorios
    texto_bateria = random.choice(temas[tema])
    texto_resistencia = random.choice(temas[tema])
    texto_transistor = random.choice(temas["musica"] if tema != "musica" else temas["literatura"])
    texto_led = random.choice(temas["circuitos"])
    texto_ground = random.choice(temas[tema])
    
    # Crear el diagrama
    with schemdraw.Drawing() as d:
        # Batería (la musa)
        d += elm.BatteryCell().label(f'LA MUSA\n{texto_bateria}', loc='bottom')
        
        # Resistencia
        d += elm.Resistor().right().label(f'RESISTENCIA\n{texto_resistencia}')
        
        # Transistor (amplifica la inspiración)
        d += elm.BjtNpn().right().label(f'TRANSISTOR\n{texto_transistor}')
        
        # LED (el verso que brilla)
        d += elm.LED().right().label(f'LED\n{texto_led}')
        
        # Cerrar el circuito con Ground
        d += elm.Ground().down()
        d += elm.Line().left().to((0, 0))  # vuelve al punto inicial de la batería
        
        # Título bonito en la esquina
        d.draw(show=False)  # solo dibuja
        d.ax.text(0.1, -1.5, f'Corriente de {tema.upper()} • {random.randint(5, 220)} V • {random.randint(50, 440)} Hz',
                  fontsize=10, style='italic', color='purple')
    
    d.save(filename)
    print(f"✅ ¡Circuito poético guardado como: {filename}")
    return filename

# ==================== USO RÁPIDO ====================
if __name__ == "__main__":
    print("🤖 Bot Generador de Circuitos Poéticos (schemdraw) encendido")
    print("Ejemplos: literatura | musica | circuitos | random")
    
    while True:
        entrada = input("\nTema > ").strip().lower()
        if entrada in ["salir", "exit", "q"]:
            break
        if entrada == "":
            entrada = "random"
        generar_circuito_poetico(entrada)