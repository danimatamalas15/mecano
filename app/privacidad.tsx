import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function Privacidad() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Política de Privacidad</Text>
                <Text style={styles.date}>Última actualización: 10 de marzo de 2026</Text>

                <Text style={styles.h2}>1. Introducción</Text>
                <Text style={styles.p}>Bienvenido a Mecano. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos su información cuando utiliza nuestra aplicación móvil.</Text>

                <Text style={styles.h2}>2. Permisos y Recopilación de Datos</Text>
                <Text style={styles.p}>Nuestra aplicación requiere acceso a ciertas funciones de su dispositivo para proveer nuestros servicios adecuadamente:</Text>
                <Text style={styles.listItem}>• Micrófono y Reconocimiento de Voz: Solicitamos acceso al micrófono y al reconocimiento de voz para permitirle convertir su voz en texto y facilitar el llenado de formularios o interactuar con las funciones de búsqueda.</Text>
                <Text style={styles.listItem}>• Acceso a Internet: Solicitamos acceso a Internet para poder procesar información, conectarnos con nuestros servidores o servicios de terceros para el reconocimiento de voz y proveer información en tiempo real.</Text>

                <Text style={styles.h2}>3. Uso de la Información</Text>
                <Text style={styles.p}>La información recopilada mediante el micrófono y reconocimiento de voz se utiliza de forma transitoria para procesar su solicitud de texto a voz y no almacenamos grabaciones de audio en nuestros servidores web ni vendemos esta información a terceros.</Text>

                <Text style={styles.h2}>4. Terceros</Text>
                <Text style={styles.p}>Podemos utilizar servicios de terceros (como Google Speech-to-Text) para el procesamiento de voz a texto. Su uso está sujeto a las políticas de privacidad de los proveedores de dichos servicios integrados en su dispositivo (como Google o Apple).</Text>

                <Text style={styles.h2}>5. Seguridad</Text>
                <Text style={styles.p}>Nos esforzamos por proteger su información utilizando medios comercialmente aceptables. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro y no podemos garantizar su seguridad absoluta.</Text>

                <Text style={styles.h2}>6. Cambios en la Política de Privacidad</Text>
                <Text style={styles.p}>Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página.</Text>

                <Text style={styles.h2}>7. Contacto</Text>
                <Text style={styles.p}>Si tiene alguna pregunta o sugerencia sobre nuestra Política de Privacidad, no dude en contactarnos a través de los canales de soporte de la aplicación.</Text>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        padding: 24,
        maxWidth: 800,
        marginHorizontal: 'auto',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#64748b',
        marginBottom: 24,
    },
    h2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 24,
        marginBottom: 12,
    },
    p: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
        marginBottom: 16,
    },
    listItem: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
        marginBottom: 8,
        paddingLeft: 10,
    }
});
