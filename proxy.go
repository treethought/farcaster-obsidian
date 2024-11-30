package main

import (
	_ "embed"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"text/template"
)

//go:embed siwn.html
var sinwhtml []byte

func main() {
	target := "https://api.neynar.com/"
	u, err := url.Parse(target)
	if err != nil {
		log.Fatalf("Invalid target URL: %v", err)
	}

	clientID := os.Getenv("CLIENT_ID")
	if clientID == "" {
		log.Fatal("CLIENT_ID not set in environment")
	}

	apiKey := os.Getenv("API_KEY")
	if apiKey == "" {
		log.Fatal("API_KEY not set in environment")
	}
	proxy := httputil.NewSingleHostReverseProxy(u)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("Error: %v", err)
	}
	proxy.ModifyResponse = func(r *http.Response) error {
		if r.StatusCode != http.StatusOK {
			log.Printf("Response: %s %s", r.Status, r.Request.URL.String())
		}
		r.Header.Del("Access-Control-Allow-Origin")
		return nil
	}

	http.HandleFunc("/signin", func(w http.ResponseWriter, r *http.Request) {
		tmpl, err := template.New("signin").Parse(string(sinwhtml))
		if err != nil {
			log.Fatal("failed to parse template: ", err)
		}
		data := struct {
			ClientID string
		}{
			ClientID: clientID,
		}
		err = tmpl.Execute(w, data)
		if err != nil {
			log.Println("failed to execute template: ", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.String())

		if !strings.HasPrefix(r.URL.Path, "/v2/farcaster") {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "3600")
			w.WriteHeader(http.StatusOK)
			return
		}

		r.URL.Host = u.Host
		r.URL.Scheme = u.Scheme
		r.Header.Set("X-Forwarded-Host", r.Header.Get("Host"))
		r.Host = u.Host

		r.Header.Set("x-api-key", apiKey)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		proxy.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Proxy server is running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
