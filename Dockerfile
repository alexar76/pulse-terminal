FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_BASE_PATH=/pulse/
ARG VITE_PULSE_DEFAULT_CONTOUR=live
ARG VITE_PULSE_MONITOR_API=api/monitor
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
ENV VITE_PULSE_DEFAULT_CONTOUR=${VITE_PULSE_DEFAULT_CONTOUR}
ENV VITE_PULSE_MONITOR_API=${VITE_PULSE_MONITOR_API}
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5199
