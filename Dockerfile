# Use a imagem base do OpenSUSE
FROM node:22.5-alpine
# ENV JAVA_HOME=/usr/lib64/jvm/java-11-openjdk
# ENV PATH=$PATH:$JAVA_HOME/bin

WORKDIR /app
COPY . .
EXPOSE 8081:8081
# Comando padrão para o container
CMD ["npm","start"]
