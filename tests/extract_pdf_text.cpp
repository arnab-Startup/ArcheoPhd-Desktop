#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <regex>
#include <cctype>

int main() {
    std::string path = "../testdocs/DOC-20241118-WA0013. (1).pdf";
    std::ifstream file(path, std::ios::binary);
    if (!file.is_open()) {
        std::cout << "Could not open " << path << std::endl;
        return 1;
    }

    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    std::cout << "Read " << content.size() << " bytes." << std::endl;

    // Search for text operators in PDF: (string) Tj or [(string)...] TJ
    std::regex re_literal(R"(\(([^\)\\]{3,})\))");
    auto words_begin = std::sregex_iterator(content.begin(), content.end(), re_literal);
    auto words_end = std::sregex_iterator();

    std::cout << "Sample extracted text snippets from document:" << std::endl;
    int count = 0;
    for (std::sregex_iterator i = words_begin; i != words_end && count < 25; ++i) {
        std::smatch match = *i;
        std::string match_str = match[1].str();
        // filter printable
        bool printable = true;
        for (char c : match_str) {
            if (!isprint((unsigned char)c)) { printable = false; break; }
        }
        if (printable && match_str.length() >= 4) {
            std::cout << "  * \"" << match_str << "\"" << std::endl;
            count++;
        }
    }

    return 0;
}
